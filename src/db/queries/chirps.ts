import { asc, desc, eq } from 'drizzle-orm';
import { db } from '../index.js';
import { chirps, NewChirp } from '../schema.js';

export async function createChirp(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();
  return result;
}

export async function getChirps(sort: 'asc' | 'desc') {
  const result = await db
    .select()
    .from(chirps)
    .orderBy(sort === 'asc' ? asc(chirps.createdAt) : desc(chirps.createdAt));
  return result;
}

export async function getChirpsByAuthor(
  authorId: string,
  sort: 'asc' | 'desc'
) {
  const result = await db
    .select()
    .from(chirps)
    .where(eq(chirps.userId, authorId))
    .orderBy(sort === 'asc' ? asc(chirps.createdAt) : desc(chirps.createdAt));
  return result;
}

export async function getChirp(id: string) {
  const rows = await db.select().from(chirps).where(eq(chirps.id, id));
  if (!rows.length) return;
  return rows[0];
}

export async function deleteChirp(id: string) {
  const result = await db.delete(chirps).where(eq(chirps.id, id)).returning();
  return result.length > 0;
}
