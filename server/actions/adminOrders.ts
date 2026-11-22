"use server";

import db from "../index";
import { orders } from "../schema";
import { eq, desc } from "drizzle-orm";
import { getAdminSession } from "../lib/adminSession";
import { writeAuditLog } from "../lib/audit";

export async function getOrders() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid order id");
  const allowedTransitions: Record<string, string[]> = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };
  const [current] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1);
  if (!current) throw new Error("Order not found");
  if (!allowedTransitions[current.status]?.includes(status)) throw new Error("Invalid order status transition");

  const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
  await writeAuditLog("UPDATE_ORDER_STATUS", "order", id, `Order #${id}: ${current.status} → ${status}`, session.id);
  return order;
}
