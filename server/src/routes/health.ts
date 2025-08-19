import { Router } from 'express';

export const healthRoutes = Router();

healthRoutes.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
