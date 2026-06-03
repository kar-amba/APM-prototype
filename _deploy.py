import os
import sys
import time
import tarfile
import posixpath
import paramiko

HOST = os.environ["SSH_HOST"]
USER = os.environ["SSH_USER"]
PASSWORD = os.environ.get("SSH_PASS")
KEY_PATH = os.path.join(os.path.expanduser("~"), ".ssh", "apm_server_rsa")

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
TARBALL = os.path.join(PROJECT_DIR, "_apm_deploy.tar.gz")
REMOTE_DIR = "/opt/apm"
REMOTE_TAR = "/tmp/apm_deploy.tar.gz"

# Что НЕ кладём в архив (служебка, зависимости, артефакты, секреты деплоя).
EXCLUDE_DIRS = {"node_modules", ".git", "dist", "dist-ssr", ".apm", ".vscode",
                "agent-transcripts", "terminals", "mcps"}
EXCLUDE_FILES = {"_apm_deploy.tar.gz", "_deploy.py", "_ssh_connect.py",
                 "_ssh_setup_key.py"}
EXCLUDE_SUFFIX = (".log", ".tsbuildinfo")


def should_include(rel):
    parts = rel.replace("\\", "/").split("/")
    if any(p in EXCLUDE_DIRS for p in parts):
        return False
    name = parts[-1]
    if name in EXCLUDE_FILES:
        return False
    if name.endswith(EXCLUDE_SUFFIX):
        return False
    return True


def make_tarball():
    print("=== Packaging project ===")
    if os.path.exists(TARBALL):
        os.remove(TARBALL)
    count = 0
    with tarfile.open(TARBALL, "w:gz") as tar:
        for root, dirs, files in os.walk(PROJECT_DIR):
            dirs[:] = [d for d in dirs
                       if should_include(os.path.relpath(os.path.join(root, d), PROJECT_DIR))]
            for f in files:
                full = os.path.join(root, f)
                rel = os.path.relpath(full, PROJECT_DIR)
                if should_include(rel):
                    tar.add(full, arcname=rel.replace("\\", "/"))
                    count += 1
    size = os.path.getsize(TARBALL) / 1024 / 1024
    print(f"Packed {count} files -> {TARBALL} ({size:.2f} MB)")


def _try_connect(**auth):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname=HOST, username=USER, timeout=45,
                   banner_timeout=120, auth_timeout=90,
                   look_for_keys=False, allow_agent=False, **auth)
    return client


def connect(retries=6):
    # Баннер сервера приходит нестабильно — делаем несколько попыток с паузой.
    methods = []
    if os.path.exists(KEY_PATH):
        methods.append(("key", {"key_filename": KEY_PATH}))
    if PASSWORD:
        methods.append(("password", {"password": PASSWORD}))
    last = None
    for attempt in range(1, retries + 1):
        for label, auth in methods:
            try:
                client = _try_connect(**auth)
                print(f"Connected via {label} (attempt {attempt}).")
                return client
            except Exception as e:
                last = e
                print(f"Attempt {attempt} via {label} failed: {e}")
        time.sleep(5)
    raise SystemExit(f"Could not connect after {retries} attempts: {last}")


def run(client, cmd, label, timeout=2400, check=True):
    print(f"\n=== {label} ===")
    print(f"$ {cmd}")
    sys.stdout.flush()
    chan = client.get_transport().open_session()
    chan.settimeout(timeout)
    chan.get_pty()
    chan.exec_command(cmd)
    buf = b""
    while True:
        got = False
        if chan.recv_ready():
            data = chan.recv(8192)
            sys.stdout.buffer.write(data)
            sys.stdout.flush()
            got = True
        if chan.exit_status_ready() and not chan.recv_ready():
            break
        if not got:
            time.sleep(0.05)
    # drain
    while chan.recv_ready():
        sys.stdout.buffer.write(chan.recv(8192))
    sys.stdout.flush()
    code = chan.recv_exit_status()
    print(f"\n[exit {code}] {label}")
    if check and code != 0:
        client.close()
        raise SystemExit(f"FAILED: {label} (exit {code})")
    return code


def upload(client):
    print("\n=== Uploading tarball via SFTP ===")
    sftp = client.open_sftp()
    size = os.path.getsize(TARBALL)
    last = [0]

    def cb(done, total):
        pct = int(done * 100 / total)
        if pct >= last[0] + 10:
            last[0] = pct
            print(f"  upload {pct}%")
    sftp.put(TARBALL, REMOTE_TAR, callback=cb)
    sftp.close()
    print("Upload complete.")


def main():
    make_tarball()
    client = connect()
    client.get_transport().set_keepalive(30)

    run(client, "swapon --show && echo '---' && free -h", "Current swap/memory", check=False)

    # Swap: создаём 2G только если своп отсутствует (на 1GB RAM сборка может упереться в память).
    run(client,
        "if [ -z \"$(swapon --show)\" ]; then "
        "fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && "
        "grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab; "
        "echo 'swap created'; else echo 'swap already present'; fi",
        "Ensure swap")

    run(client, "export DEBIAN_FRONTEND=noninteractive; apt-get update -y",
        "apt-get update")
    run(client, "export DEBIAN_FRONTEND=noninteractive; "
                "apt-get install -y ca-certificates curl gnupg",
        "Install prerequisites")

    # Docker: если не установлен — ставим через официальный скрипт get.docker.com.
    run(client,
        "if command -v docker >/dev/null 2>&1; then echo 'docker present'; "
        "else curl -fsSL https://get.docker.com -o /tmp/get-docker.sh && sh /tmp/get-docker.sh; fi",
        "Install Docker", timeout=1200)
    run(client, "docker --version && docker compose version", "Verify Docker")
    run(client, "systemctl enable --now docker", "Enable Docker service", check=False)

    upload(client)

    run(client, f"rm -rf {REMOTE_DIR} && mkdir -p {REMOTE_DIR} && "
                f"tar -xzf {REMOTE_TAR} -C {REMOTE_DIR} && ls -la {REMOTE_DIR}",
        "Extract project")

    run(client, f"cd {REMOTE_DIR} && docker compose build app",
        "Build Docker image", timeout=2400)

    run(client, f"cd {REMOTE_DIR} && docker compose up -d app",
        "Start container")

    # Firewall: если ufw активен — открываем 8080.
    run(client,
        "if command -v ufw >/dev/null 2>&1 && ufw status | grep -q 'Status: active'; "
        "then ufw allow 8080/tcp; else echo 'ufw inactive/absent, skipping'; fi",
        "Open firewall port 8080", check=False)

    print("\n=== Waiting for container to come up ===")
    time.sleep(6)
    run(client, "docker compose -f /opt/apm/docker-compose.yml ps", "Container status", check=False)
    run(client, "curl -s -o /dev/null -w 'HTTP %{http_code}\\n' http://127.0.0.1:8080/ || true",
        "Local HTTP check", check=False)
    run(client, "curl -s http://127.0.0.1:8080/ | head -c 400 || true",
        "Index preview", check=False)

    client.close()
    print(f"\nDONE. App should be available at http://{HOST}:8080/")


if __name__ == "__main__":
    main()
