"use server";

import db from "../index";
import { orders } from "../schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "../lib/auth";
import { writeLog } from "./adminLogs";

export async function getOrders() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) throw new Error("Invalid status");

  const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
  await writeLog("UPDATE_ORDER_STATUS", "order", id, `Order #${id} → ${status}`, session.id);
  return order;
}
