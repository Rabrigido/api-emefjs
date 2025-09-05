// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import { httpLoggerToFile, httpLoggerToConsole } from './logger/http-logger.js';
import { reposRouter } from './routes/repos.router.js';
import cors from 'cors';

export function createApp() {
  const app = express();

  // Estás detrás de Nginx → usa la IP real desde X-Forwarded-For
  app.set('trust proxy', true);

  // ====== CORS ======
  const allowedOrigins = [
    'https://mm-app-77559.ondigitalocean.app', // Front en DO App Platform
    'https://emefjs.duckdns.org',              // Si abres UI desde acá también
      'http://localhost:4200'                  // Front local dev
  ];

  const corsOptions: cors.CorsOptions = {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Permite curl/ThunderClient
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // pon true solo si usarás cookies/sesiones
  };

  // Preflight global antes de todo
  app.options(/.*/, cors(corsOptions));
  app.use(cors(corsOptions));
  // ====== /CORS ======

  // Parseo de JSON ANTES de las rutas
  app.use(express.json({ limit: '5mb' }));

  // Logs (consola y archivo)
  app.use(httpLoggerToConsole);
  app.use(httpLoggerToFile);

  // (Opcional) logs por router para depurar body/params
  app.use('/repos', (req, _res, next) => {
    const bodyPreview = (() => {
      try { return JSON.stringify(req.body).slice(0, 500); } catch { return '[unserializable]'; }
    })();
    console.log(`[Repos] ${req.method} ${req.originalUrl} body=${bodyPreview}`);
    next();
  });

  // Rutas
  app.use('/repos', reposRouter);

  // Health simple
  app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

  // 404 explícito
  app.use((req: Request, res: Response) => {
    console.warn(`[404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Not Found' });
  });

  // Handler de errores
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err?.message ?? err);
    if (err?.stack) console.error(err.stack);
    res.status(err?.status || 500).json({ error: 'Internal Server Error' });
  });

  return app;
}

// Default export
export default createApp;
