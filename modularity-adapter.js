// modularity-adapter.js
export async function runModularityMetrics(codePath) {
  // Importa el paquete real del repo (se llama metrics-js-ts)
  const mod = await import('metrics-js-ts');

  // Descubrimos qué función expone la lib:
  const fn =
    mod.calculateMetrics ??
    mod.runAll ??
    mod.analyzeProject ??
    mod.default;

  if (typeof fn !== 'function') {
    return { error: 'No suitable entry found', exports: Object.keys(mod) };
  }

  // Llamada con opciones razonables (evitar ruido)
  const options = {
    codePath,                 // principal
    path: codePath,           // alias por si la lib usa otro nombre
    root: codePath,           // alias
    glob: '**/*.{ts,tsx,js,jsx}',
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/.output/**',
      '**/docs/**',
      '**/examples/**',
      '**/*.min.*'
    ]
  };

  const raw = await fn(options);

  // Normalización: intenta encontrar “las métricas” en distintos campos
  const keys = Object.keys(raw ?? {});
  const candidate =
    raw?.metrics ??
    raw?.summary ??
    raw?.results ??
    raw?.data ??
    undefined;

  // Si la lib solo retorna errores, deja claro que no hay métricas útiles
  const onlyErrors =
    keys.length > 0 &&
    keys.every(k => k.endsWith('errors'));

  return {
    keys,                            // para depurar qué vino
    hasMetrics: Boolean(candidate && Object.keys(candidate).length && !onlyErrors),
    metrics: onlyErrors ? undefined : candidate,
    details: raw?.files ?? raw?.byFile ?? undefined,
    errors: {
      parse: raw?.['parse-errors'] ?? [],
      metric: raw?.['metric-errors'] ?? [],
      traverse: raw?.['traverse-errors'] ?? []
    },
    // opcional: incluye la salida cruda si quieres inspeccionarla
    // raw,
  };
}
