declare module 'jtmetrics' {
  export interface CalculateMetricsOptions {
    codePath: string;
    useDefaultMetrics?: boolean;
    include?: string[];
    excludeGlobs?: string[];
    parserOptions?: any;
  }
  export function calculateMetrics(options: CalculateMetricsOptions): Promise<any>;
}
