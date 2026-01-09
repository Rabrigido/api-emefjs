// src/types/modularity-metrics.d.ts

// === API actual del paquete ===
// (coincide con la implementación: codePath obligatorio,
//  y opcionales customMetricsPath/useDefaultMetrics)
declare module 'jtmetrics' {
  export interface CalculateMetricsOptions {
    codePath: string;
    customMetricsPath?: string;
    useDefaultMetrics?: boolean;
  }

  export type MetricsOutput = Record<string, any>;

  export function calculateMetrics(
    opts: CalculateMetricsOptions
  ): Promise<MetricsOutput>;
}

// Métricas por defecto (si las expones/consumes desde el submódulo)
// (El submódulo 'modularity-metrics/metrics' no existe, por lo que se elimina esta declaración)

// === Alias legacy para compatibilidad ===
// Si en algún punto del código quedó 'jtmetrics', que resuelva al mismo API.
declare module 'jtmetrics' {
  export interface CalculateMetricsOptions {
    codePath: string;
    customMetricsPath?: string;
    useDefaultMetrics?: boolean;
  
  }
  
  export function calculateMetrics(
    opts: CalculateMetricsOptions
  ): Promise<MetricsOutput>;
}
