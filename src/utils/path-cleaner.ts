import path from "node:path";

export function cleanMetricsPaths(metrics: any, repoRoot: string) {
  if (!metrics || typeof metrics !== "object") return metrics;

  const cleaned: Record<string, any> = {};
  for (const [absPath, data] of Object.entries(metrics)) {
    // Saca la parte absoluta hasta la raíz del repo
    const relPath = path.relative(repoRoot, absPath);
    cleaned[relPath] = data;
  }
  return cleaned;
}
