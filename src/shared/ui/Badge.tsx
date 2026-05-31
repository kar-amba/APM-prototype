import type { ReactNode } from 'react';

export type BadgeTone =
  | 'default'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function Badge({
  tone = 'default',
  dot = false,
  className,
  children,
}: BadgeProps) {
  const classes = ['badge', `badge-${tone}`, className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}
