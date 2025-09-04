// src/logger/http-logger.ts
import morgan from 'morgan';
import path from 'node:path';
import fs from 'node:fs';
import { createStream } from 'rotating-file-stream'; // 🔸 named import (no default)

// Directorio de logs (configurable con LOG_DIR)
const logDir = process.env.LOG_DIR ?? path.join(process.cwd(), 'logs');
fs.mkdirSync(logDir, { recursive: true });

// Rotación diaria + compresión (opciones compatibles con tipos)
const accessLogStream = createStream('access.log', {
  interval: '1d',       // rota diariamente
  path: logDir,         // carpeta de logs
  compress: 'gzip',     // comprime los viejos
});

// Log a archivo
export const httpLoggerToFile = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream: accessLogStream }
);

// Log a consola (útil para `pm2 logs`)
export const httpLoggerToConsole = morgan(
  ':method :url :status - :response-time ms'
);
