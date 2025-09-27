import { Request, Response } from "express";
import { config } from "../config.js";
import { deleteAllUsers } from "../db/queries/users.js";

export async function handlerReset(_: Request, res: Response) {
  if (config.api.platform !== "dev") {
    res.status(403).send("403 Forbidden");
    return;
  }

  config.api.fileServerHits = 0;
  await deleteAllUsers();

  res.status(200).send("Metrics and users table reset");
}
