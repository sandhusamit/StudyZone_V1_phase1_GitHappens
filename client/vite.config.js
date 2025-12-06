import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // <-- just index.html
    },
  },

  // Proxy API requests to the backend server - allows communication between client and server during development
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    watch: {
      // Be explicit about what NOT to watch
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '../server/**',
        '../../**/server/**', // in case of deeper monorepo
        '**/coverage/**',
        '**/*.log',
      ],
      usePolling: true,
      interval: 1000,
    },
    fs: {
      strict: true,
      allow: ['.'],
    },
  },
});
