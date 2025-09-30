import { Request, Response } from "express";
import { BadRequestError, NotFoundError, UnauthorizeError } from "./errors.js";
import { getUserByEmail } from "../db/queries/users.js";
import { checkPassword, makeJWT } from "../auth.js";
import { config } from "../config.js";
import { NewUser } from "../db/schema.js";

export type UserResponse = Omit<NewUser, "hashed_password"> & { token: string };

type UserLoginParams = {
  email: string;
  password: string;
  expiresInSeconds?: number;
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

  const expiresIn = params.expiresInSeconds || config.jwt.defaultDuration;
  const secret = config.jwt.secret;
  const token = makeJWT(user.id, expiresIn, secret);

  res.status(200).json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token,
  } satisfies UserResponse);
}
