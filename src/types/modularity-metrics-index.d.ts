declare module 'metrics-js-ts' {
  export interface CalculateMetricsOptions {
    codePath: string;
    useDefaultMetrics?: boolean;
    include?: string[];
    excludeGlobs?: string[];
    parserOptions?: any;
  }
  export function calculateMetrics(options: CalculateMetricsOptions): Promise<any>;
}
