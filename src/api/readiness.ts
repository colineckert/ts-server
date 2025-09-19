import { Request, Response } from 'express';

export function handlerReadiness(_: Request, res: Response) {
  res.status(200).set('Content-Type', 'text/plain').send('OK');
}
