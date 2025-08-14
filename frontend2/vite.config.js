import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";
import history from 'connect-history-api-fallback'

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    port: 5173,
    fs: {
      strict: false,
    },
    middlewareMode: false,
  },
  // Redirection fallback pour react-router
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
