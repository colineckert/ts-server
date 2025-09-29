import { describe, it, expect, beforeAll } from "vitest";
import { checkPassword, hashPassword, makeJWT, validateJWT } from "./auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPassword(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT validation", () => {
  const userId = "test-user-1";
  const expiresIn = 12000;
  const secret = "test-secret";
  let jwt: string;

  beforeAll(async () => {
    jwt = makeJWT(userId, expiresIn, secret);
  });

  it("should return the sub for valid jwt", async () => {
    const result = validateJWT(jwt, secret);
    expect(result).toEqual(userId);
  });
});
