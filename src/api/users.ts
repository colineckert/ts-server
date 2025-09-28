import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { hashPassword } from "../auth.js";

type CreateUserParams = {
  email: string;
  password: string;
};

export async function handlerCreateUser(req: Request, res: Response) {
  const params: CreateUserParams = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required create user fields");
  }

  const hashedPassword = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashed_password: hashedPassword,
  });

  if (!user) {
    throw new Error("Failed to create user");
  }

  res.status(201).json(user);
}
