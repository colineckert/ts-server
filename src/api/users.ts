import { Request, Response } from "express";
import { createUser } from "src/db/queries/users";

type CreateUserBody = {
  email: string;
};

export async function handlerCreateUser(req: Request, res: Response) {
  const newUser: CreateUserBody = req.body;

  const result = await createUser(newUser);

  res.status(201).json(result);
}
