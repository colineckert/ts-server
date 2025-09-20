import { Request, Response } from 'express';
import { config } from '../config.js';

export function handlerMetrics(_: Request, res: Response) {
  res.status(200).send(`Hits: ${config.fileserverHits}`);
}

export function handlerReset(_: Request, res: Response) {
  config.fileserverHits = 0;
  res.status(200).send(`Metrics reset`);
}
