import argon2 from "argon2";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { BadRequestError, UnauthorizeError } from "./api/errors.js";
import { Request } from "express";
import { config } from "./config.js";
import { createRefreshToken } from "./db/queries/refreshTokens.js";

const { randomBytes } = await import("node:crypto");

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function checkPassword(password: string, hash: string) {
  if (!password) return false;
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
  userId: string,
  expiresIn: number,
  secret: string,
): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;
  const signPayload: payload = {
    iss: config.jwt.issuer,
    sub: userId,
    iat: issuedAt,
    exp: expiresAt,
  };

  return jwt.sign(signPayload, secret, { algorithm: "HS256" });
}

export function validateJWT(tokenString: string, secret: string) {
  let decoded: payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new UnauthorizeError("Invalid token");
  }

  if (decoded.iss !== config.jwt.issuer) {
    throw new UnauthorizeError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UnauthorizeError("No user ID in token");
  }

  return decoded.sub;
}

export function getBearerToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new UnauthorizeError("Invalid request. Missing Authorization header");
  }

  const splitAuth = authHeader.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
    throw new UnauthorizeError("Malformed authorization header");
  }

  return splitAuth[1];
}

export async function makeRefreshToken(userId: string) {
  const buf = randomBytes(256).toString("hex");

  // refresh token expires in 60 days
  const now = new Date();
  const expiresAt = new Date(
    new Date(now.getTime() + config.jwt.refreshTokenExpiry),
  );

  const refreshToken = await createRefreshToken({
    token: buf,
    userId,
    expiresAt,
    revokedAt: null,
  });

  return refreshToken;
}

export function getAPIKey(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new UnauthorizeError("No authorization header present");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "ApiKey") {
    throw new BadRequestError("Invalid authorization header");
  }

  return parts[1];
}
