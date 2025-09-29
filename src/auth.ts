import argon2 from "argon2";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UnauthorizeError } from "./api/errors.js";

const TOKEN_ISSUER = "chirpy";

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
    iss: TOKEN_ISSUER,
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

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UnauthorizeError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UnauthorizeError("No user ID in token");
  }

  return decoded.sub;
}
