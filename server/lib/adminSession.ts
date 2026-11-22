import db from "@/server/index";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import { getSession } from "./auth";

/** Resolve the signed cookie against the live user record before admin work. */
export async function getAdminSession() {
  const tokenSession = await getSession();
  if (!tokenSession || !Number.isSafeInteger(tokenSession.id) || tokenSession.id < 1) return null;
  const [user] = await db.select({ id: users.id, username: users.username, role: users.role }).from(users).where(eq(users.id, tokenSession.id)).limit(1);
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) return null;
  return { id: user.id, username: user.username, role: user.role };
}
