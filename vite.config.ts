import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const GAS_URL =
  process.env.VITE_GAS_WEB_APP_URL ||
  'https://script.google.com/macros/s/AKfycbzk62kyLViOPyVBss7qtChwW1qg8OoIEeltpo-JRxWjILxhZH3scotmyB6JHkur1Z8n/exec';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'dev-api-dashboard-proxy',
        configureServer(server) {
          server.middlewares.use('/api/dashboard', async (_req, res) => {
            const targetUrl = `${GAS_URL}${GAS_URL.includes('?') ? '&' : '?'}action=getDashboardData`;
            try {
              const response = await fetch(targetUrl, {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                },
                redirect: 'follow',
              });

              if (!response.ok) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(
                  JSON.stringify({
                    error: true,
                    message: 'Backend Google Apps Script tidak dapat diakses.',
                  })
                );
                return;
              }

              const rawText = await response.text();
              try {
                JSON.parse(rawText);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.end(rawText);
              } catch {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(
                  JSON.stringify({
                    error: true,
                    message: 'Backend Google Apps Script tidak dapat diakses.',
                  })
                );
              }
            } catch {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(
                JSON.stringify({
                  error: true,
                  message: 'Backend Google Apps Script tidak dapat diakses.',
                })
              );
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
