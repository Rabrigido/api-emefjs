import type { ErrorRequestHandler } from 'express';
export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
const status = (err as any)?.status || (err as any)?.response?.status || 500;
const msg = (err as any)?.message || 'Internal Server Error';
res.status(status).json({ error: msg });
};