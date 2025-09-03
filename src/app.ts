import express from 'express';
import { reposRouter } from './routes/repos.router.js';
import { errorMiddleware } from './middlewares/error.middleware.js';


export function createApp() {
const app = express();
app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/repos', reposRouter);
app.use(errorMiddleware);
return app;
}