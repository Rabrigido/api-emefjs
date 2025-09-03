// src/server.ts
import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { ensureDirs, loadRegistryFromDisk } from './services/registry.service.js';

console.log('[BOOT] cwd=', process.cwd());            // <-- AQUI
console.log('[BOOT] DATA_DIR=', ENV.DATA_DIR);        // <-- AQUI
console.log('[BOOT] SCAN_GLOB=', ENV.SCAN_GLOB);      // <-- AQUI
console.log('[BOOT] DISABLE_METRICS=', process.env.DISABLE_METRICS); // <-- AQUI

const app = createApp();
await ensureDirs();
await loadRegistryFromDisk();
app.listen(ENV.PORT, () => console.log(`API escuchando en http://localhost:${ENV.PORT}`));
