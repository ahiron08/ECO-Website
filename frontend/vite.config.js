import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  build: {
    rollupOptions: {
      output: {
        // Split the heavy libraries into their own long-lived chunks so an app
        // change does not force a re-download of them, and the entry chunk stays small.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          icons: ['react-icons/fa', 'react-icons/fi'],
        },
      },
    },
  },
})
