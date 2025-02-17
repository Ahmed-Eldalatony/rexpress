
// server/index.ts
import express from 'express';
import path from 'path';
import fs from 'fs';

async function createServer() {
  const app = express();
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // Dynamically import Vite to avoid loading it in production
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      // We set middlewareMode to 'html' so Vite handles HTML requests
      server: { middlewareMode: 'html' },
      // Tell Vite where our client code lives:
      root: path.resolve(__dirname, '../client'),
      appType: 'custom'
    });
    // Use Vite's connect instance as middleware
    app.use(vite.middlewares);

    // Catch-all: Let Vite handle transforming index.html on every request
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // Read the client index.html
        let template = fs.readFileSync(
          path.resolve(__dirname, '../client/index.html'),
          'utf-8'
        );
        // Let Vite transform the HTML (inject HMR, etc.)
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (err: any) {
        vite.ssrFixStacktrace(err);
        next(err);
      }
    });
  } else {
    // In production, serve the pre-built assets from the client/dist folder
    const distPath = path.resolve(__dirname, '../client/dist');
    app.use(express.static(distPath));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

createServer();
