// server/src/metrics/register-metrics.ts
import {
  MetricsRegistry,
  // Si tu lib exporta un registro por defecto, ajústalo aquí.
} from 'modularity-metrics';

import {
  classesPerFile,
  methodsPerFile,
  importExportCoupling,
  fanInFanOutPerClass,
  fanInFanOutPerClassMethod,
  // agrega aquí otras métricas propias si tienes
} from 'modularity-metrics/metrics';

let alreadyRegistered = false;

export function registerAllMetrics() {
  if (alreadyRegistered) return; // evita registrar dos veces en hot-reloads
  MetricsRegistry.register([
    classesPerFile(),
    methodsPerFile(),
    importExportCoupling(),
    fanInFanOutPerClass(),
    fanInFanOutPerClassMethod(),
  ]);
  alreadyRegistered = true;

  // Log útil para confirmar
  const keys = MetricsRegistry.list().map(m => m.key);
  console.log('[modularity-metrics] Registradas:', keys);
}
