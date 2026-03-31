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
      // In local dev, forward /api/code-runner → OneCompiler directly.
      // The API key is injected here so it never ships in the browser bundle.
      '/api/code-runner': {
        target: 'https://api.onecompiler.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/code-runner/, '/v1/run'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const key =
              process.env.VITE_ONECOMPILER_API_KEY ||
              process.env.VITE_RAPIDAPI_KEY ||
              '';
            if (key) proxyReq.setHeader('X-API-Key', key);
          });
        },
      },
    },
  },
});
