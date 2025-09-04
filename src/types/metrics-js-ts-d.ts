// src/types/modularity-metrics.d.ts

// === API actual del paquete ===
// (coincide con la implementación: codePath obligatorio,
//  y opcionales customMetricsPath/useDefaultMetrics)
declare module 'modularity-metrics' {
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
declare module 'modularity-metrics/metrics' {
  export const defaultMetrics: any;
}

// === Alias legacy para compatibilidad ===
// Si en algún punto del código quedó 'metrics-js-ts', que resuelva al mismo API.
declare module 'metrics-js-ts' {
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
