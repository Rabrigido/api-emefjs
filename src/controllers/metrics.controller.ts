// src/controllers/metrics.controller.ts
import { Request, Response } from "express";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { calculateLocSloc } from "../services/metrics/loc-sloc.service.js";
import { calculateCyclomaticComplexity } from "../services/metrics/cyclomatic.service.js";
import { analyzeDependencies } from "../services/metrics/dependencies.service.js";
import { analyzeArchitecture } from "../services/metrics/architecture.service.js";

export const getMetricByName = async (req: Request, res: Response) => {
  try {
    const { id, metricName } = req.params;

    // Ruta al archivo del resultado del scan
    const jsonPath = path.resolve(`data/json/${id}.json`);
    if (!existsSync(jsonPath)) {
      return res.status(404).json({ error: `Archivo ${id}.json no encontrado` });
    }

    // Leer y parsear el JSON
    const raw = await readFile(jsonPath, "utf8");
    const data = JSON.parse(raw);

    // Buscar la métrica dentro de modularityMetrics
    const metrics = data.modularityMetrics || {};
    const metricEntry = Object.entries(metrics).find(
      ([, value]: [string, any]) =>
        value.name?.toLowerCase().includes(metricName.toLowerCase()) ||
        value.id === metricName ||
        metricName.toLowerCase() ===
        value.name?.toLowerCase().replace(/\s+/g, "-")
    );

    if (!metricEntry) {
      return res
        .status(404)
        .json({ error: `No se encontró la métrica "${metricName}" en ${id}.json` });
    }

    const [metricKey, metricValue] = metricEntry;
    const responseBody =
      metricValue && typeof metricValue === "object"
        ? { key: metricKey, ...(metricValue as Record<string, unknown>) }
        : { key: metricKey, value: metricValue };
    return res.json(responseBody);
  } catch (err) {
    console.error("Error al obtener la métrica:", err);
    return res.status(500).json({ error: "Error interno al leer la métrica" });
  }
};





export const locSloc = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repoPath = path.resolve(`data/repos/${id}`);

    if (!existsSync(repoPath)) {
      return res.status(404).json({ error: `Repositorio ${id} no encontrado` });
    }

    const result = await calculateLocSloc(repoPath);

    // 🧹 Limpiar rutas: quitar todo hasta después del UUID
    const cleanByFile: Record<string, { loc: number; sloc: number }> = {};
    const repoBase = path.join("data", "repos", id);

    for (const [filePath, data] of Object.entries(result.byFile)) {
      let relative = filePath.replace(repoBase, ""); // quita el prefijo completo
      relative = relative.replace(/^[/\\]+/, ""); // elimina barras iniciales
      relative = relative.replace(/\\/g, "/"); // uniformiza separadores
      cleanByFile[relative] = data;
    }

    return res.json({
      name: "Lines of Code (LOC/SLOC)",
      description:
        "Cuenta líneas totales y efectivas (no vacías ni comentadas) por archivo y total.",
      total: result.total,
      byFile: cleanByFile,
      fileCount: result.fileCount,
    });
  } catch (err) {
    console.error("Error en locSloc:", err);
    return res.status(500).json({ error: "Error interno al calcular LOC/SLOC" });
  }
};

export const cyclomatic = async (req, res) => {
  try {
    const { id } = req.params;
    const repoPath = `data/repos/${id}`;
    const result = await calculateCyclomaticComplexity(repoPath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error interno al calcular Complejidad ciclomatica" });
  }
};

export const dependencies = async (req, res) => {
  try {
    const { id } = req.params;
    const repoPath = `data/repos/${id}`;
    const result = await analyzeDependencies(repoPath);
    res.json(result);
  } catch (err) {

    res.status(500).json({ error: "Error interno al generar grafo de dependencias" });
  }
};

export const architecture = async (req, res) => {
  try {
    const { id } = req.params;
    const repoPath = `data/repos/${id}`;
    const result = await analyzeArchitecture(repoPath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error interno al elaborar grafo de arquitectura" });
  }
};
