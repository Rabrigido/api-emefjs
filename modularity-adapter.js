// modularity-adapter.js
import { calculateMetrics } from "metrics-js-ts";

export async function runModularityMetrics(codePath) {
  const result = await calculateMetrics({
    codePath,
    useDefaultMetrics: true
  });

  const keys = Object.keys(result ?? {}).filter(k => !k.endsWith("-errors"));
  return {
    keys,
    hasMetrics: keys.length > 0,
    metrics: result,
    errors: {
      parse: result?.["parse-errors"] ?? [],
      metric: result?.["metric-errors"] ?? [],
      traverse: result?.["traverse-errors"] ?? []
    }
  };
}

// helper para listar claves
export function metricKeys(result) {
  return Object.keys(result).filter(k => !k.endsWith("-errors"));
}
