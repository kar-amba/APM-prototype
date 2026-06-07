import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Разбиение вендоров на отдельные чанки (Vite 8 / rolldown): `manualChunks`
    // устарел в пользу `advancedChunks.groups`. Цель — ни один чанк не превышает
    // порога предупреждения (500 kB). Маршруты уже грузятся лениво (`React.lazy`).
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
            },
            {
              name: 'i18n-vendor',
              test: /[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/,
            },
            { name: 'vendor', test: /[\\/]node_modules[\\/]/ },
          ],
        },
      },
    },
  },
});
