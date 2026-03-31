import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    proxy: {
      // In local dev, forward /api/code-runner → Piston (free, no API key needed).
      // This mirrors exactly what the Express server does in production.
      '/api/code-runner': {
        target: 'https://emkc.org',
        changeOrigin: true,
        rewrite: () => '/api/v2/piston/execute',
      },
    },
  },
});
