import { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

export function middlewareLogResponse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.on('finish', () => {
    const statusCode = res.statusCode;
    if (statusCode !== 200) {
      console.log(
        `[NON-OK] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`
      );
    }
  });
  next();
}

export function middlewareMetricsInc(
  _: Request,
  __: Response,
  next: NextFunction
) {
  config.fileserverHits++;
  next();
}
