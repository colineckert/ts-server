import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";

type CreateUserParams = {
  email: string;
};

export async function handlerCreateUser(req: Request, res: Response) {
  const params: CreateUserParams = req.body;

  if (!params.email) {
    throw new BadRequestError("Missing required create user fields");
  }

  const user = await createUser(params);

  if (!user) {
    throw new Error("Failed to create user");
  }

  res.status(201).json(user);
}
