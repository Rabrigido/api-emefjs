// src/services/metrics/architecture.service.ts
import { statSync } from "fs";
import { existsSync } from "fs";
import { glob } from "glob";
import path from "path";

export async function analyzeArchitecture(codePath: string) {
  if (!existsSync(codePath)) throw new Error(`Ruta no encontrada: ${codePath}`);

  const files = await glob(`${codePath}/**/*`, { nodir: true });
  const folders = new Set(files.map((f) => path.dirname(f)));
  const extensions = new Map<string, number>();

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    extensions.set(ext, (extensions.get(ext) || 0) + 1);
  }

  const avgDepth =
    [...folders].reduce((sum, f) => sum + f.split(path.sep).length, 0) / folders.size;

  return {
    name: "Architecture Overview",
    description: "Analiza la estructura de carpetas y tipos de archivos.",
    totalFiles: files.length,
    totalFolders: folders.size,
    averageDepth: avgDepth.toFixed(2),
    fileTypes: Object.fromEntries(extensions),
  };
}
