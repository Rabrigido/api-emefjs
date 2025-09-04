// src/server.ts
import createApp from './app.js';
import { ENV } from './config/env.js';
import { ensureDirs, loadRegistryFromDisk } from './services/registry.service.js';

console.log('[BOOT] cwd=', process.cwd());
console.log('[BOOT] DATA_DIR=', ENV.DATA_DIR);
console.log('[BOOT] SCAN_GLOB=', ENV.SCAN_GLOB);
console.log('[BOOT] DISABLE_METRICS=', process.env.DISABLE_METRICS);

const app = createApp();

await ensureDirs();
await loadRegistryFromDisk();

// Detrás de Nginx, escucha sólo en loopback
app.listen(ENV.PORT, '127.0.0.1', () => {
  console.log(`API escuchando en http://127.0.0.1:${ENV.PORT}`);
});
