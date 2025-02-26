//// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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
    outDir: 'dist-client',
    // This tells Vite which file to use as the entry point for the server bundle.
    rollupOptions: {
      // Here you can customize the output for your SSR bundle.
      output: {
        // Customize options as needed. For example, you could define directory paths or file naming conventions.
      }
    }
  }
});
