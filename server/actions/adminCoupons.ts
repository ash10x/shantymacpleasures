"use server";

import db from "../index";
import { coupons } from "../schema";
import { eq } from "drizzle-orm";
import { getSession } from "../lib/auth";
import { writeLog } from "./adminLogs";

export async function getCoupons() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return db.select().from(coupons).orderBy(coupons.createdAt);
}

export type CouponInput = {
  code: string;
  type: "percent" | "flat";
  amount: number;
  minOrder: number;
  maxUses: number | null;
  expiresAt: string | null;
};

export async function createCoupon(input: CouponInput) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const code = input.code.trim().toUpperCase();
  if (!code) throw new Error("Code is required");
  if (input.type === "percent" && (input.amount < 1 || input.amount > 100))
    throw new Error("Percent must be 1–100");
  if (input.amount <= 0) throw new Error("Amount must be positive");

  const [coupon] = await db.insert(coupons).values({
    code,
    type: input.type,
    amount: input.amount,
    minOrder: input.minOrder,
    maxUses: input.maxUses,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  }).returning();

  await writeLog("CREATE_COUPON", "coupon", coupon.id, `Created coupon "${code}"`, session.id);
  return coupon;
}

export async function toggleCoupon(id: number, active: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const [coupon] = await db.update(coupons).set({ active }).where(eq(coupons.id, id)).returning();
  await writeLog("TOGGLE_COUPON", "coupon", id, `Coupon "${coupon.code}" ${active ? "enabled" : "disabled"}`, session.id);
  return coupon;
}

export async function deleteCoupon(id: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const [coupon] = await db.delete(coupons).where(eq(coupons.id, id)).returning();
  await writeLog("DELETE_COUPON", "coupon", id, `Deleted coupon "${coupon?.code}"`, session.id);
  return coupon;
}
