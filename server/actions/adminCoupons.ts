"use server";

import db from "../index";
import { coupons } from "../schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "../lib/adminSession";
import { writeAuditLog } from "../lib/audit";

export async function getCoupons() {
  const session = await getAdminSession();
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
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const code = input.code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{2,50}$/.test(code)) throw new Error("Code must contain 2–50 letters, numbers, dashes, or underscores");
  if (input.type !== "percent" && input.type !== "flat") throw new Error("Invalid coupon type");
  if (!Number.isSafeInteger(input.amount) || input.amount < 1 || input.amount > 2_147_483_647 || !Number.isSafeInteger(input.minOrder) || input.minOrder < 0 || input.minOrder > 2_147_483_647) throw new Error("Coupon amounts must be valid whole numbers");
  if (input.maxUses !== null && (!Number.isSafeInteger(input.maxUses) || input.maxUses < 1 || input.maxUses > 2_147_483_647)) throw new Error("Maximum uses must be a valid positive whole number");
  if (input.expiresAt !== null && (!Number.isFinite(new Date(input.expiresAt).getTime()) || new Date(input.expiresAt) <= new Date())) throw new Error("Expiration must be a valid future date");
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

  await writeAuditLog("CREATE_COUPON", "coupon", coupon.id, `Created coupon "${code}"`, session.id);
  return coupon;
}

export async function toggleCoupon(id: number, active: boolean) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  if (!Number.isSafeInteger(id) || id < 1 || typeof active !== "boolean") throw new Error("Invalid coupon update");
  const [coupon] = await db.update(coupons).set({ active }).where(eq(coupons.id, id)).returning();
  if (!coupon) throw new Error("Coupon not found");
  await writeAuditLog("TOGGLE_COUPON", "coupon", id, `Coupon "${coupon.code}" ${active ? "enabled" : "disabled"}`, session.id);
  return coupon;
}

export async function deleteCoupon(id: number) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid coupon id");
  const [coupon] = await db.delete(coupons).where(eq(coupons.id, id)).returning();
  if (!coupon) throw new Error("Coupon not found");
  await writeAuditLog("DELETE_COUPON", "coupon", id, `Deleted coupon "${coupon.code}"`, session.id);
  return coupon;
}
