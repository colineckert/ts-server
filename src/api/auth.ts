import { Request, Response } from "express";
import { BadRequestError, NotFoundError, UnauthorizeError } from "./errors.js";
import { getUserByEmail } from "../db/queries/users.js";
import {
  checkPassword,
  getBearerToken,
  makeJWT,
  makeRefreshToken,
} from "../auth.js";
import { config } from "../config.js";
import { RefreshToken } from "../db/schema.js";
import {
  getRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refreshTokens.js";
import { UserResponse } from "./users.js";

export type LoginResponse = UserResponse & {
  token: string;
  refreshToken: string;
};

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

  const refreshToken = await makeRefreshToken(user.id);

  res.status(200).json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token,
    refreshToken: refreshToken.token,
  } satisfies LoginResponse);
}

function isTokenExpired(token: RefreshToken): boolean {
  if (!token.expiresAt) return false;
  const expiresAt =
    typeof token.expiresAt === "string"
      ? new Date(token.expiresAt)
      : token.expiresAt;
  return expiresAt < new Date();
}

export async function handlerRefresh(req: Request, res: Response) {
  const token = getBearerToken(req);

  const refreshToken = await getRefreshToken(token);
  const tokenExpired = isTokenExpired(refreshToken);

  if (!refreshToken || !!refreshToken.revokedAt || tokenExpired) {
    throw new UnauthorizeError("No valid refresh token for user");
  }

  const newToken = makeJWT(
    refreshToken.userId,
    config.jwt.defaultDuration,
    config.jwt.secret,
  );

  res.status(200).json({ token: newToken });
}

export async function handlerRevoke(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  await revokeRefreshToken(refreshToken);
  res.status(204).send();
}
