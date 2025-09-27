import { Request, Response } from "express";
import { config } from "../config.js";

export function handlerReset(_: Request, res: Response) {
  config.api.fileServerHits = 0;
  res.status(200).send(`Metrics reset`);
}
