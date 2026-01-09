// modularity-adapter.js
import { calculateMetrics } from "jtmetrics";

export async function runModularityMetrics(codePath) {
  const result = await calculateMetrics({
    codePath,
    useDefaultMetrics: true,
    include: ['**/*.{js,jsx,ts,tsx}'],
    excludeGlobs: [
      '**/node_modules/**','**/dist/**','**/build/**','**/coverage/**',
      '**/.next/**','**/.turbo/**','**/.output/**','**/.cache/**',
      '**/docs/**','**/examples/**','**/*.min.*'
    ]
  });

  const keys = Object.keys(result ?? {}).filter(k => !k.endsWith('-errors'));
  return {
    keys,
    hasMetrics: keys.length > 0,
    metrics: result, // <-- TODO: aquí vienen TODAS las métricas
    errors: {
      parse: result?.['parse-errors'] ?? [],
      metric: result?.['metric-errors'] ?? [],
      traverse: result?.['traverse-errors'] ?? []
    }
  };
}
