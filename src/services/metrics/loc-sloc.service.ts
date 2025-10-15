import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { glob } from "glob";

/**
 * Calcula líneas de código (LOC) y líneas efectivas (SLOC)
 * ignorando vacías y comentarios, por archivo y total.
 */
export async function calculateLocSloc(codePath: string) {
  if (!existsSync(codePath)) {
    throw new Error(`Ruta no encontrada: ${codePath}`);
  }

  const files = await glob(`${codePath}/**/*.{js,ts,jsx,tsx,py,java}`, {
    nodir: true,
  });

  const results: Record<string, { loc: number; sloc: number }> = {};
  let totalLoc = 0;
  let totalSloc = 0;

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const lines = content.split(/\r?\n/);
    const loc = lines.length;
    const sloc = lines.filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false; // línea vacía
      // filtra comentarios simples o de bloque
      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("#") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("*/")
      )
        return false;
      return true;
    }).length;

    results[file] = { loc, sloc };
    totalLoc += loc;
    totalSloc += sloc;
  }

  return {
    total: { loc: totalLoc, sloc: totalSloc },
    byFile: results,
    fileCount: Object.keys(results).length,
  };
}
