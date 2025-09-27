import { Request, Response } from "express";
import { config } from "../config.js";

export function handlerMetrics(_: Request, res: Response) {
  res.status(200).set("Content-Type", "text/html; charset=utf-8").send(`
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
      </body>
    </html>
  `);
}

export function handlerReset(_: Request, res: Response) {
  config.api.fileServerHits = 0;
  res.status(200).send(`Metrics reset`);
}
