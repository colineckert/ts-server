import { Request, Response } from "express";
import { BadRequestError, NotFoundError, UnauthorizeError } from "./errors.js";
import { getUserByEmail, UserResponse } from "../db/queries/users.js";
import { checkPassword } from "../auth.js";

type UserLoginParams = {
  email: string;
  password: string;
};

export async function handlerLogin(req: Request, res: Response) {
  const params: UserLoginParams = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields for login");
  }

  const user = await getUserByEmail(params.email);
  if (!user) {
    throw new NotFoundError(`User with email: ${params.email} not found`);
  }

  const isMatchingUser = await checkPassword(
    params.password,
    user.hashedPassword,
  );

  if (!isMatchingUser) {
    throw new UnauthorizeError("Email and password do not match");
  }

  res.status(200).json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
}
