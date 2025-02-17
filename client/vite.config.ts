// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // Specify the client directory as the project root for Vite:
  root: process.cwd(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    // Optional proxy (if your React app makes API calls)
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    // Output the built files into the client/dist folder (so Express can serve them)
    outDir: 'dist'
  }
});
