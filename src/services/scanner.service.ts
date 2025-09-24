// src/services/scanner.service.ts
import type { ScanResult } from "../types/ScanResult";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path, { dirname, resolve as pathResolve } from "node:path";
import { glob } from "glob";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import {cleanMetricsPaths} from "../utils/path-cleaner";
import fs from "node:fs";

// ───────────────── helpers ─────────────────
/** Si existe /src usa ese path; si no, cae al raíz del repo.
 *  Prioriza JS transpilado para análisis más estable. */
async function resolveBestCodePath(repoPath: string) {
  const candidates = ["lib", "dist", "build", "out", "src", "packages", "apps", "app"];
  for (const c of candidates) {
    const p = path.join(repoPath, c);
    if (existsSync(p)) return p;
  }
  return repoPath; // fallback final
}

// ───────────────── basic scan ─────────────────
/** Contador mínimo: archivos, líneas, imports/exports y distribución por extensión. */
export async function basicScan(
  codePath: string,
  pattern?: string
): Promise<ScanResult["stats"]> {
  const pat = pattern ?? process.env.SCAN_GLOB ?? "**/*.{ts,tsx,js,jsx}";

  const files = await glob(pat, {
    cwd: codePath,
    dot: false,
    nodir: true,
    ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/.output/**",
      "**/.cache/**",
      "**/docs/**",
      "**/examples/**",
      "**/*.min.*",
    ],
  });

  let lines = 0,
    imports = 0,
    exports = 0;
  const byExtension: Record<string, number> = {};

  for (const rel of files) {
    const ext = path.extname(rel) || "";
    byExtension[ext] = (byExtension[ext] ?? 0) + 1;
    const full = path.join(codePath, rel);
    const txt = await readFile(full, "utf8");
    lines += txt.split(/\r?\n/).length;
    imports += (txt.match(/\bimport\b/g) || []).length;
    exports += (txt.match(/\bexport\b/g) || []).length;
  }

  return { files: files.length, lines, byExtension, imports, exports };
}

// ───────────────── metrics runner (proceso aislado) ─────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Ejecuta metrics en un proceso limpio → sin caché ni estado previo */

function runMetricsIsolated(codePath: string, timeoutMs = 600000) {
  const runner = pathResolve(__dirname, "../../metrics-runner.js");
  return new Promise((resolveP, rejectP) => {
    execFile(
      "node",
      [runner, codePath],
      { timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024, windowsHide: true },
      (err, stdout, stderr) => {
        if (err) {
          console.warn("[METRICS] runner failed:", err.message);
          if (stderr) console.warn("[METRICS] runner stderr:", stderr.slice(0, 2000));
          return rejectP(err);
        }
        try {
          const parsed = JSON.parse(stdout || "{}");
          // limpia paths absolutos y relativos fuera del repo
          const cleaned = cleanMetricsPaths(parsed, codePath);
          return resolveP(cleaned);
        } catch (e) {
          console.warn("[METRICS] invalid JSON from runner");
          return rejectP(e);
        }
      }
    );
  });
}


// ───────────────── entrypoint ─────────────────
export async function scanRepo(
  repoId: string,
  repoPath: string,
  scanGlob?: string
): Promise<ScanResult> {
  console.log("[SCAN] repoId=", repoId);
  console.log("[SCAN] repoPath(in)=", repoPath);

  const codePath = await resolveBestCodePath(repoPath);
  console.log("[SCAN] codePath(resolved)=", codePath);

  const stats = await basicScan(codePath, scanGlob);

  let modularityMetrics: unknown | undefined = undefined;

  if (process.env.DISABLE_METRICS === "1") {
    console.log("[METRICS] disabled by env DISABLE_METRICS=1");
  } else {
    try {
      modularityMetrics = await runMetricsIsolated(codePath);
      const keys = modularityMetrics && typeof modularityMetrics === "object"
        ? Object.keys(modularityMetrics as Record<string, any>)
        : [];
      console.log("[METRICS] keys:", keys);
    } catch (e: any) {
      console.warn("[METRICS] failed:", e?.message || e);
      modularityMetrics = undefined; // no rompas la respuesta si falla
    }
  }

  return {
    repoId,
    scannedAt: new Date().toISOString(),
    codePath,
    stats,
    modularityMetrics, // ← adjuntamos crudo lo que entrega la lib (si hay)
  };
}
