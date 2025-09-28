import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

type UserResponse = Omit<NewUser, "hashed_password">;

export async function createUser(user: NewUser): Promise<UserResponse> {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();

  return {
    id: result.id,
    email: result.email,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

export async function deleteAllUsers() {
  await db.delete(users);
}
