// src/services/metrics/dependencies.service.ts
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { glob } from "glob";

export async function analyzeDependencies(codePath: string) {
  if (!existsSync(codePath)) throw new Error(`Ruta no encontrada: ${codePath}`);

  const files = await glob(`${codePath}/**/*.{js,ts,jsx,tsx,ts}`, { nodir: true });
  const results: Record<string, { imports: string[] }> = {};
  const dependencyGraph: Record<string, string[]> = {};

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const imports = [
      ...content.matchAll(/import\s+(?:.+?\s+from\s+)?['"](.+?)['"]/g),
      ...content.matchAll(/require\(['"](.+?)['"]\)/g)
    ].map((m) => m[1]);

    results[file] = { imports };
    dependencyGraph[file] = imports;
  }

  return {
    name: "Dependencies Graph",
    description: "Analiza las dependencias internas y externas entre archivos.",
    files: Object.keys(results).length,
    graph: dependencyGraph,
  };
}
