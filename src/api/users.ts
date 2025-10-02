import { Request, Response } from "express";
import { createUser, updateUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { config } from "../config.js";
import { NewUser } from "../db/schema.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

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
    hashedPassword: hashedPassword,
  });

  if (!user) {
    throw new Error("Failed to create user");
  }

  res.status(201).json(user);
}

export async function handlerUpdateUser(req: Request, res: Response) {
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  const params: CreateUserParams = req.body;
  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required update user fields");
  }

  const newHashedPassword = await hashPassword(params.password);

  const user = await updateUser(userId, params.email, newHashedPassword);

  res.status(200).json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
}
