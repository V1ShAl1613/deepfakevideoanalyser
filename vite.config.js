import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      // Forward all API requests directly to the FastAPI Python backend
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  // Rewrite /static/... requests so they resolve directly inside the frontend directory
  plugins: [
    {
      name: 'static-asset-rewriter',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/static/')) {
            req.url = req.url.replace('/static', '');
          }
          next();
        });
      },
    },
  ],
});
