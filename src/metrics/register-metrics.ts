// src/metrics/register-metrics.ts
import { calculateMetrics } from 'metrics-js-ts';

export async function runMetrics(codePath: string, customMetricsPath?: string) {
  return await calculateMetrics({
    codePath,
    useDefaultMetrics: true,      // usa las métricas por defecto del paquete
    ...(customMetricsPath ? { customMetricsPath } : {}),
  });
}

// util opcional: listar “keys” de métricas calculadas
export function metricKeys(result: Record<string, any>): string[] {
  // El resultado es un objeto { 'files': {...}, 'class-coupling': {...}, 'parse-errors': [...], ... }
  return Object.keys(result).filter(k => !k.endsWith('-errors'));
}
