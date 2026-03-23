import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const codeRunnerApiKey = env.VITE_ONECOMPILER_API_KEY || env.VITE_RAPIDAPI_KEY || '';
  const codeRunnerProxy = codeRunnerApiKey
    ? {
        '/api/code-runner': {
          target: 'https://api.onecompiler.com',
          changeOrigin: true,
          rewrite: () => '/v1/run',
          configure: (proxy: any) => {
            proxy.on('proxyReq', (proxyReq: any) => {
              proxyReq.setHeader('X-API-Key', codeRunnerApiKey);
            });
          },
        },
      }
    : undefined;

  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    plugins: [react()],
    server: codeRunnerProxy ? { proxy: codeRunnerProxy } : undefined,
    preview: codeRunnerProxy ? { proxy: codeRunnerProxy } : undefined,
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './test-setup.tsx',
    },
  };
});
