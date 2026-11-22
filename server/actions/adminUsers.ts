"use server";

import db from "../index";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getAdminSession } from "../lib/adminSession";
import { writeAuditLog } from "../lib/audit";

export async function getUsers() {
  const session = await getAdminSession();
  if (session?.role !== "super_admin") throw new Error("Forbidden");
  return db.select({ id: users.id, username: users.username, email: users.email, role: users.role, createdAt: users.createdAt }).from(users);
}

export async function createUser(input: { username: string; email: string; password: string; role: "admin" | "super_admin" }) {
  const session = await getAdminSession();
  if (session?.role !== "super_admin") throw new Error("Forbidden");
  if (typeof input.username !== "string" || !input.username.trim() || input.username.trim().length > 100) throw new Error("Username must be 1–100 characters");
  if (typeof input.email !== "string" || input.email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) throw new Error("Enter a valid email address");
  if (typeof input.password !== "string" || input.password.length < 12 || input.password.length > 1024) throw new Error("Password must be between 12 and 1024 characters");
  if (input.role !== "admin" && input.role !== "super_admin") throw new Error("Invalid role");

  const hash = await bcrypt.hash(input.password, 12);
  const [user] = await db.insert(users).values({
    username: input.username.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: hash,
    role: input.role,
  }).returning({ id: users.id, username: users.username, email: users.email, role: users.role });

  await writeAuditLog("CREATE_USER", "user", user.id, `Created user "${user.username}" (${user.role})`, session.id);
  return user;
}

export async function deleteUser(id: number) {
  const session = await getAdminSession();
  if (session?.role !== "super_admin") throw new Error("Forbidden");
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid user id");
  if (session.id === id) throw new Error("Cannot delete yourself");

  const [user] = await db.delete(users).where(eq(users.id, id)).returning();
  if (!user) throw new Error("User not found");
  await writeAuditLog("DELETE_USER", "user", id, `Deleted user "${user.username}"`, session.id);
  return user;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 12 || newPassword.length > 1024) throw new Error("New password must be between 12 and 1024 characters");

  const [user] = await db.select().from(users).where(eq(users.id, session.id));
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect");

  const hash = await bcrypt.hash(newPassword, 12);
  await db.update(users).set({ passwordHash: hash }).where(eq(users.id, session.id));
  await writeAuditLog("CHANGE_PASSWORD", "user", session.id, "Password changed", session.id);
}
