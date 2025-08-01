import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import flowbiteReact from 'flowbite-react/plugin/vite'
import history from 'connect-history-api-fallback'

export default defineConfig({
  plugins: [react(), flowbiteReact()],
  server: {
    port: 5173,
    fs: {
      strict: false,
    },
    middlewareMode: false,
    hmr: {
      overlay: false, // facultatif : pour désactiver le message d'erreur visuel
    }
  },
  configureServer: (server) => {
    server.middlewares.use(
      history({
        verbose: true,
        rewrites: [
          { from: /^\/evenements-publics$/, to: '/index.html' },
          { from: /./, to: '/index.html' },
        ],
      })
    );
  },
})
