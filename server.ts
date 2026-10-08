import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/src/routes/api.routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Mount standalone REST API routes (No Supabase dependency)
  app.use('/api', apiRouter);

  if (!isProd) {
    // Development mode: Mount Vite middleware directly
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static assets from dist/
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[School Attendance & Workforce OS] Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[Architecture] Standalone Node.js REST API + PostgreSQL / Embedded DB (Zero Supabase subscription requirement)`);
  });
}

startServer().catch((err) => {
  console.error('[Startup Failure]:', err);
  process.exit(1);
});
