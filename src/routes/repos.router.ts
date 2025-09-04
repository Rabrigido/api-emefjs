// src/routes/repos.router.ts
import { Router } from 'express';
import { ReposController } from '../controllers/repos.controller.js';

export const reposRouter = Router();

// Listar
reposRouter.get('/', (_req, res) => {
  res.json(ReposController.list());
});

// Obtener uno
reposRouter.get('/:id', (req, res, next) => {
  try { res.json(ReposController.get(req.params.id)); }
  catch (e) { next(e); }
});

// Crear (acepta { fullName } o { gitUrl })
reposRouter.post('/', async (req, res, next) => {
  try { res.status(201).json(await ReposController.create(req.body ?? {})); }
  catch (e) { next(e); }
});

// Crear desde popular aleatorio (opcional)
reposRouter.post('/random', async (_req, res, next) => {
  try { res.status(201).json(await ReposController.loadRandom()); }
  catch (e) { next(e); }
});

// Crear por nombre explícito
reposRouter.post('/by-name/:fullName', async (req, res, next) => {
  try { res.status(201).json(await ReposController.loadByFullName(decodeURIComponent(req.params.fullName))); }
  catch (e) { next(e); }
});

// Ejecutar scan
reposRouter.post('/:id/scan', async (req, res, next) => {
  console.log('[ROUTE] /repos/:id/scan id=', req.params.id);
  try {
    const result = await ReposController.scan(req.params.id);
    console.log('[ROUTE] /repos/:id/scan done');
    res.json(result);
  } catch (e) { next(e); }
});

// Eliminar
reposRouter.delete('/:id', async (req, res, next) => {
  try { res.json(await ReposController.remove(req.params.id)); }
  catch (e) { next(e); }
});
