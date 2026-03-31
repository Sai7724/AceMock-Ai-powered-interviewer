import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env so VITE_ONECOMPILER_API_KEY is available at config time
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        // Forward /api/code-runner → OneCompiler (server-side, no CORS)
        '/api/code-runner': {
          target: 'https://api.onecompiler.com',
          changeOrigin: true,
          rewrite: () => '/v1/run',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Inject the API key server-side so it never ships in the browser bundle
              const key =
                env.VITE_ONECOMPILER_API_KEY ||
                env.VITE_RAPIDAPI_KEY ||
                '';
              if (key) proxyReq.setHeader('X-API-Key', key);

              // Ensure Content-Type is always JSON
              proxyReq.setHeader('Content-Type', 'application/json');
            });
          },
        },
      },
    },
  };
});
