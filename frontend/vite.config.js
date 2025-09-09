import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import flowbiteReact from 'flowbite-react/plugin/vite';

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  
  server: {
    port: 5173,
    proxy: {
      '/forfait': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.url.includes('/forfait/success') || req.url.includes('/forfait/cancel')) {
            return req.url; // Laisse passer directement au frontend
          }
        },
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});