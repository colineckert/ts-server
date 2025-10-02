import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { RefreshToken, refreshTokens } from "../schema.js";
import { getUserById } from "./users.js";

export async function createRefreshToken(token: RefreshToken) {
  const [result] = await db
    .insert(refreshTokens)
    .values(token)
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function getRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));

  return result;
}

export async function getUserFromRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));

  const user = await getUserById(result.userId);
  return user;
}

export async function revokeRefreshToken(token: string) {
  const rows = await db
    .update(refreshTokens)
    .set({ expiresAt: new Date() })
    .where(eq(refreshTokens.token, token))
    .returning();

  if (rows.length === 0) {
    throw new Error("Couldn't revoke token");
  }
}
