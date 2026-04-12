"use server";

import db from "../index";
import { orders, coupons } from "../schema";
import { eq } from "drizzle-orm";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type OrderInput = {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  couponCode?: string;
  cart: CartItem[];
};

export async function placeOrder(input: OrderInput) {
  if (!input.cart.length) throw new Error("Cart is empty");

  let discountAmount = 0;
  let appliedCoupon: string | undefined;

  if (input.couponCode) {
    const code = input.couponCode.trim().toUpperCase();
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    if (!coupon || !coupon.active) throw new Error("Invalid or inactive coupon code");
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new Error("Coupon has expired");
    if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) throw new Error("Coupon usage limit reached");

    const subtotal = input.cart.reduce((s, i) => s + i.price * i.quantity, 0);
    if (subtotal < coupon.minOrder) throw new Error(`Minimum order for this coupon is $${(coupon.minOrder / 100).toFixed(2)}`);

    discountAmount = coupon.type === "percent"
      ? Math.round((subtotal * coupon.amount) / 100)
      : Math.min(coupon.amount, subtotal);

    appliedCoupon = code;
    await db.update(coupons).set({ uses: coupon.uses + 1 }).where(eq(coupons.id, coupon.id));
  }

  const inserted = await db.insert(orders).values(
    input.cart.map((item, idx) => ({
      productId: item.id,
      quantity: item.quantity,
      totalPrice: item.price * item.quantity,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerAddress: input.customerAddress,
      customerCity: input.customerCity,
      couponCode: appliedCoupon ?? null,
      discountAmount: idx === 0 ? discountAmount : 0, // apply discount to first row only
      status: "pending",
    })),
  ).returning({ id: orders.id });

  return { orderIds: inserted.map((r) => r.id), discountAmount };
}

export async function validateCoupon(code: string, subtotal: number) {
  const upper = code.trim().toUpperCase();
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, upper));
  if (!coupon || !coupon.active) throw new Error("Invalid or inactive coupon");
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new Error("Coupon has expired");
  if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) throw new Error("Usage limit reached");
  if (subtotal < coupon.minOrder) throw new Error(`Minimum order $${(coupon.minOrder / 100).toFixed(2)} required`);

  const discount = coupon.type === "percent"
    ? Math.round((subtotal * coupon.amount) / 100)
    : Math.min(coupon.amount, subtotal);

  return { discount, type: coupon.type, amount: coupon.amount };
}
