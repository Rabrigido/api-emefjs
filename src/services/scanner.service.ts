// src/services/scanner.service.ts
import type { ScanResult } from "../types/ScanResult";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { glob } from "glob";

import { pathToFileURL } from "node:url";

import { calculateMetrics } from 'metrics-js-ts'; 


import fs from 'node:fs';


// ───────────────── helpers ─────────────────
function env(name: string, fallback?: string) {
  return process.env[name] ?? fallback;
}

function ms(n: string | number | undefined, fallback: number) {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

function withTimeout<T>(p: Promise<T>, ms: number, label='modularity') {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}_timeout_${ms}ms`)), ms);
    p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}


/** Si existe /src usa ese path; si no, cae al raíz del repo. */
async function resolveBestCodePath(repoPath: string) {
  // ⬇️ NUEVO ORDEN: prioriza build JS transpilado
  const candidates = ["lib", "dist", "build", "out", "src", "packages", "apps", "app"];
  for (const c of candidates) {
    const p = path.join(repoPath, c);
    if (existsSync(p)) return p;
  }
  return repoPath; // fallback final
}

// ───────────────── basic scan ─────────────────
/**
 * Contador mínimo: archivos, líneas, imports/exports y distribución por extensión.
 * Usa glob@11 (ya es promise, no necesitas promisify).
 */
// Después (fix)
export async function basicScan(
  codePath: string,
  pattern?: string
): Promise<ScanResult["stats"]> {
  // resuelve SIEMPRE un string
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
      "**/*.min.*"
    ],
  });

  let lines = 0, imports = 0, exports = 0;
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


// ───────────────── adapter opcional ─────────────────
/**
 * Intenta cargar ./modularity-adapter.js (en la raíz del server) y ejecutarlo con timeout.
 * Puedes apagarlo con DISABLE_METRICS=1
 */
// src/services/scanner.service.ts
export async function tryRunModularityMetrics(codePath: string): Promise<unknown | undefined> {
  console.log('[METRICS] direct import path=', codePath);
  try {
    const { calculateMetrics, default: def } = await import('metrics-js-ts');

    const fn = calculateMetrics ?? def;
    if (typeof fn !== 'function') {
      console.warn('[METRICS] no function exported');
      return undefined;
    }

    // Llamada mínima, como el demo:
    const raw = await fn({ codePath, useDefaultMetrics: true });

    // 🔎 Diagnóstico: ver qué campos trae
    console.log('[METRICS] raw keys:', raw && Object.keys(raw));

    return raw; // devuelve crudo para ver la forma real
  } catch (e: any) {
    console.warn('[METRICS] error:', e?.message || e);
    return undefined;
  }
}



type ScanOptions = {
  repoId: string;
  baseDir: string; // p. ej. C:\...\server\data\repos
};

function pickCodePath(baseDir: string, repoId: string) {
  const src = path.resolve(baseDir, repoId, 'src');
  const lib = path.resolve(baseDir, repoId, 'lib');
  if (fs.existsSync(src)) return src;
  if (fs.existsSync(lib)) return lib;
  return path.resolve(baseDir, repoId);
}


// ───────────────── entrypoint ─────────────────
export async function scanRepo(repoId: string, repoPath: string, scanGlob?: string): Promise<ScanResult> {
  console.log('[SCAN] repoId=', repoId);
  console.log('[SCAN] repoPath(in)=', repoPath);

  const codePath = await resolveBestCodePath(repoPath);
  console.log('[SCAN] codePath(resolved)=', codePath);

  const stats = await basicScan(codePath, scanGlob);
  const modularityMetrics = await tryRunModularityMetrics(codePath);
  return { repoId, scannedAt: new Date().toISOString(), codePath, stats, modularityMetrics };
}