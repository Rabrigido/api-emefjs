import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { glob } from "glob";

const DECISION_KEYWORDS = [
  "if", "for", "while", "case", "catch",
  "foreach", "elif", "else if"
];

const SYMBOL_KEYWORDS = ["&&", "||", "?"];

/**
 * Calcula la complejidad ciclomatica por archivo y total.
 */
export async function calculateCyclomaticComplexity(codePath: string) {
  if (!existsSync(codePath)) throw new Error(`Ruta no encontrada: ${codePath}`);
  console.log(`Iniciando calculo de complejidad ciclomatica por archivo y total.`);

  const files = await glob(`${codePath}/**/*.{js,ts,jsx,tsx,py,java}`, {
    nodir: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  });

  const results: Record<string, { complexity: number }> = {};
  let totalComplexity = 0;

  // Construir regex para palabras
  const wordRegex = new RegExp(`\\b(${DECISION_KEYWORDS.join("|")})\\b`, "g");
  // Construir regex para símbolos, escapando caracteres especiales
  const symbolRegex = new RegExp(`(${SYMBOL_KEYWORDS.map(s => s.replace(/([.*+?^${}()|[\]\/\\])/g, "\\$1")).join("|")})`, "g");

  for (const file of files) {
    const content = await readFile(file, "utf8");

    const wordMatches = content.match(wordRegex) || [];
    const symbolMatches = content.match(symbolRegex) || [];

    const complexity = 1 + wordMatches.length + symbolMatches.length; // base complexity = 1

    results[file] = { complexity };
    totalComplexity += complexity;
  }

  const averageComplexity = totalComplexity / Object.keys(results).length;
  return {
    name: "Cyclomatic Complexity",
    description: "Mide la complejidad del flujo de control del código.",
    total: totalComplexity,
    average: averageComplexity,
    byFile: results,
    fileCount: Object.keys(results).length,
  };
}
