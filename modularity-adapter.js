// modularity-adapter.js
import fs from 'node:fs';
import path from 'node:path';

function onlyErrorKeys(obj) {
  if (!obj || typeof obj !== 'object') return false;
  const keys = Object.keys(obj);
  return keys.length > 0 && keys.every(k => k.endsWith('errors'));
}

function hasMetricsLike(obj) {
  if (!obj || typeof obj !== 'object') return false;
  const cand = obj.metrics || obj.summary || obj.results || obj.data;
  return !!(cand && Object.keys(cand).length);
}

async function callLib(runAt) {
  const mod = await import('metrics-js-ts');
  const fn = mod.calculateMetrics ?? mod.runAll ?? mod.analyzeProject ?? mod.default;
  if (typeof fn !== 'function') return { error: 'No suitable entry found', exports: Object.keys(mod) };
  // llamada mínima como el demo-run
  return await fn({ codePath: runAt, useDefaultMetrics: true });
}

export async function runModularityMetrics(codePath) {
  // 0) Si te doy una pista manual, úsala primero (por env)
  const hint = process.env.METRICS_ROOT_HINT ? path.resolve(codePath, process.env.METRICS_ROOT_HINT) : null;
  const candidates = [
    hint,
    path.resolve(codePath),
    path.join(codePath, 'lib'),
    path.join(codePath, 'dist'),
    path.join(codePath, 'build'),
    path.join(codePath, 'out'),
    path.join(codePath, 'src'),
  ].filter(Boolean);

  for (const root of candidates) {
    if (!fs.existsSync(root)) continue;
    if (process.env.METRICS_VERBOSE === '1') console.log('[METRICS] trying at:', root);

    const raw = await callLib(root);

    // Si ya trae métricas "de verdad", devuélvelas crudas
    if (hasMetricsLike(raw)) {
      if (process.env.METRICS_VERBOSE === '1') console.log('[METRICS] success at:', root);
      return raw; // ← crudo: verás exactamente el shape real
    }

    // Si NO son métricas pero tampoco es solo errores, igual devuélvelo
    if (!onlyErrorKeys(raw)) {
      return raw;
    }
    // Si es solo errores, intenta con el siguiente candidato
  }

  // Si ningún candidato funcionó, intentamos una última vez en codePath original y devolvemos lo que haya
  return await callLib(codePath);
}
