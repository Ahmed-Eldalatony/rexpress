import express from 'express';
import path from 'path';
import fs from 'fs';

async function createServer() {
  const app = express();
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // --- DEVELOPMENT MODE ---
    // Dynamically import Vite in middleware mode.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      // This sets up Vite as middleware which means it handles
      // the HTML file transformation and serves your assets.
      server: { middlewareMode: 'html' },
      // Define the root of your project where Vite will operate.
      root: path.resolve(__dirname, '../client'),
      // Use a custom app type to tell Vite you’re doing SSR.
      appType: 'custom'
    });
    // Attach Vite's middleware to our Express app.
    app.use(vite.middlewares);

    // SSR Route for Development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // Read the HTML template from disk.
        let template = fs.readFileSync(
          path.resolve(__dirname, '../client/index.html'),
          'utf-8'
        );
        // Dynamically load the server entry module.
        // This allows you to take advantage of Vite’s HMR (Hot Module Replacement).
        const ssrModule = await vite.ssrLoadModule('/src/entry-server.tsx');
        // Render the app to a string using the SSR render function.
        const appHtml = ssrModule.render(url, {});
        // Inject the rendered HTML into the template at the placeholder.
        const html = template.replace(`<!--ssr-outlet-->`, appHtml);
        // Let Vite transform the HTML. This step handles things like injecting HMR scripts.
        const transformedHtml = await vite.transformIndexHtml(url, html);
        // Send the fully rendered HTML back to the client.
        res.status(200).set({ 'Content-Type': 'text/html' }).end(transformedHtml);
      } catch (err) {
        // Fix the stack trace for easier debugging with Vite.
        vite.ssrFixStacktrace(err);
        next(err);
      }
    });
  } else {
    // --- PRODUCTION MODE ---
    // Define the path where the built assets live.
    const distPath = path.resolve(__dirname, '../client/dist');
    // Serve static files from the dist directory (e.g., CSS, JS assets).
    app.use(express.static(distPath));

    // SSR Route for Production
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // Read the pre-built HTML template.
        let template = fs.readFileSync(
          path.resolve(distPath, 'index.html'),
          'utf-8'
        );
        // Load the SSR module from the production build.
        // This is the pre-built version of your SSR code.
        const ssrModule = require(path.resolve(distPath, 'server/entry-server.js'));
        // Render the app to a string.
        const appHtml = ssrModule.render(url, {});
        // Inject the rendered HTML into the template.
        const html = template.replace(`<!--ssr-outlet-->`, appHtml);
        // Send the complete HTML back to the client.
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        next(err);
      }
    });
  }

  // Start the server on the specified port (defaults to 3000).
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

createServer();

