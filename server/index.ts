import express from 'express';
import path from 'path';
import { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const app = express();
async function createServer() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const isDev = process.env.NODE_ENV !== 'production';

  // These are fallback static directories (if you have any extra assets in build/public)
  app.use(express.static(path.join(__dirname, 'build')));
  app.use(express.static(path.join(__dirname, 'public')));

  if (isDev) {
    // --- DEVELOPMENT MODE ---
    // Create Vite server in middleware mode for HMR and dynamic SSR loading.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: 'html' },
      // Set the client root folder
      root: path.resolve(__dirname, '../client'),
      appType: 'custom'
    });
    app.use(vite.middlewares);

    // SSR Route for Development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // Load the HTML template from the client source.
        let template = fs.readFileSync(
          path.resolve(__dirname, '../client/index.html'),
          'utf-8'
        );
        // Dynamically load the SSR entry module.
        const ssrModule = await vite.ssrLoadModule('/src/entry-server.tsx');
        // Render the page using the SSR render function.
        const appHtml = ssrModule.render(url, {});
        // Inject the rendered HTML into the template.
        const html = template.replace(`<!--ssr-outlet-->`, appHtml);
        // Transform the HTML to inject HMR scripts, etc.
        const transformedHtml = await vite.transformIndexHtml(url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(transformedHtml);
      } catch (err) {
        vite.ssrFixStacktrace(err);
        next(err);
      }
    });
  } else {
    // --- PRODUCTION MODE ---
    // Serve static client assets (HTML, CSS, JS) from the dist-client folder.
    const clientDistPath = path.resolve(__dirname, '../client/dist-client');
    app.use(express.static(clientDistPath));

    // SSR Route for Production
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // Read the pre-built HTML template from client/dist-client.
        let template = fs.readFileSync(
          path.resolve(clientDistPath, 'index.html'),
          'utf-8'
        );
        // Load the pre-built SSR bundle from client/dist-sever.
        const ssrModule = require(path.resolve(__dirname, '../client/dist-server/entry-server.js'));
        // Render the page to a string.
        const appHtml = ssrModule.render(url, {});
        // Inject the rendered HTML into the template.
        const html = template.replace(`<!--ssr-outlet-->`, appHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        next(err);
      }
    });
  }

  // Start the Express server.
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

createServer();

