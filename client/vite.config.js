import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    rollupOptions: {
      input: '/src/main.jsx',
    },
  },

  // Proxy API requests to the backend server - allows communication between client and server during development
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  }
});
