import { Router } from 'express';
import { ReposController } from '../controllers/repos.controller.js';


export const reposRouter = Router();


reposRouter.get('/', (_req, res) => {
res.json(ReposController.list());
});


reposRouter.post('/random', async (req, res, next) => {
try { res.status(201).json(await ReposController.loadRandom()); }
catch (e) { next(e); }
});


reposRouter.post('/by-name/:fullName', async (req, res, next) => {
try { res.status(201).json(await ReposController.loadByFullName(decodeURIComponent(req.params.fullName))); }
catch (e) { next(e); }
});


// src/routes/repos.routes.ts
reposRouter.post('/:id/scan', async (req, res, next) => {
  console.log('[ROUTE] /repos/:id/scan id=', req.params.id); // <-- AQUI
  try {
    const result = await ReposController.scan(req.params.id);
    console.log('[ROUTE] /repos/:id/scan done');             // <-- AQUI
    res.json(result);
  } catch (e) { next(e); }
});
