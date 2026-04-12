"use server";

import db from "../index";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getSession } from "../lib/auth";
import { writeLog } from "./adminLogs";

export async function getUsers() {
  const session = await getSession();
  if (session?.role !== "super_admin") throw new Error("Forbidden");
  return db.select({ id: users.id, username: users.username, email: users.email, role: users.role, createdAt: users.createdAt }).from(users);
}

export async function createUser(input: { username: string; email: string; password: string; role: "admin" | "super_admin" }) {
  const session = await getSession();
  if (session?.role !== "super_admin") throw new Error("Forbidden");

  const hash = await bcrypt.hash(input.password, 12);
  const [user] = await db.insert(users).values({
    username: input.username,
    email: input.email,
    passwordHash: hash,
    role: input.role,
  }).returning({ id: users.id, username: users.username, email: users.email, role: users.role });

  await writeLog("CREATE_USER", "user", user.id, `Created user "${user.username}" (${user.role})`, session.id);
  return user;
}

export async function deleteUser(id: number) {
  const session = await getSession();
  if (session?.role !== "super_admin") throw new Error("Forbidden");
  if (session.id === id) throw new Error("Cannot delete yourself");

  const [user] = await db.delete(users).where(eq(users.id, id)).returning();
  await writeLog("DELETE_USER", "user", id, `Deleted user "${user?.username}"`, session.id);
  return user;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [user] = await db.select().from(users).where(eq(users.id, session.id));
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect");

  const hash = await bcrypt.hash(newPassword, 12);
  await db.update(users).set({ passwordHash: hash }).where(eq(users.id, session.id));
  await writeLog("CHANGE_PASSWORD", "user", session.id, "Password changed", session.id);
}
