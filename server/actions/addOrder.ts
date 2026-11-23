"use server";

import db from "../index";
import { orders, coupons, products } from "../schema";
import { and, eq, gt, lt, sql } from "drizzle-orm";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  color?: string;
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
  if (!Array.isArray(input.cart) || input.cart.length === 0 || input.cart.length > 50) throw new Error("Cart is empty or invalid");
  if (!input.customerName?.trim() || input.customerName.length > 255) throw new Error("Enter a valid name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customerEmail ?? "") || input.customerEmail.length > 255) throw new Error("Enter a valid email address");
  if (!input.customerAddress?.trim() || input.customerAddress.length > 500 || !input.customerCity?.trim() || input.customerCity.length > 255) throw new Error("Enter a valid shipping address");

  const quantities = new Map<string, { id: number; quantity: number; color: string }>();
  const productQuantities = new Map<number, number>();
  for (const item of input.cart) {
    if (!Number.isSafeInteger(item.id) || item.id < 1 || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error("Invalid product or quantity");
    if (item.color !== undefined && (typeof item.color !== "string" || item.color.length > 80)) throw new Error("Invalid product color");
    const color = item.color?.trim() ?? "";
    const key = `${item.id}:${color}`;
    const line = quantities.get(key);
    quantities.set(key, { id: item.id, color, quantity: (line?.quantity ?? 0) + item.quantity });
    productQuantities.set(item.id, (productQuantities.get(item.id) ?? 0) + item.quantity);
  }
  if ([...productQuantities.values()].some((quantity) => quantity > 99)) throw new Error("Invalid quantity");
  const authoritativeProducts = await db.select().from(products);
  const byId = new Map(authoritativeProducts.map((product) => [product.id, product]));
  const verifiedCart = [...quantities.values()].map(({ id, quantity, color }) => {
    const product = byId.get(id);
    if (!product) throw new Error("A product in your cart is no longer available");
    if (product.colors.length && !product.colors.includes(color)) throw new Error(`Select an available color for ${product.name}`);
    if (!product.colors.length && color) throw new Error(`${product.name} has no color options`);
    if (!Number.isSafeInteger(product.price) || product.price < 0) throw new Error("Product price is invalid");
    return { product, quantity, color };
  });
  for (const [id, quantity] of productQuantities) {
    const product = byId.get(id);
    if (product && product.quantity < quantity) throw new Error(`${product.name} does not have enough stock`);
  }
  const subtotal = verifiedCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  if (!Number.isSafeInteger(subtotal)) throw new Error("Order total is invalid");

  let discountAmount = 0;
  let appliedCoupon: string | undefined;
  let reservedCouponId: number | undefined;

  if (input.couponCode) {
    const code = input.couponCode.trim().toUpperCase();
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    if (!coupon || !coupon.active) throw new Error("Invalid or inactive coupon code");
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new Error("Coupon has expired");
    if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) throw new Error("Coupon usage limit reached");

    if (subtotal * 100 < coupon.minOrder) throw new Error(`Minimum order for this coupon is JMD ${(coupon.minOrder / 100).toFixed(2)}`);

    // Product prices and order totals are whole JMD; coupon fixed amounts and
    // minimums are stored as JMD cents.
    discountAmount = coupon.type === "percent"
      ? Math.round((subtotal * coupon.amount) / 100)
      : Math.min(Math.round(coupon.amount / 100), subtotal);

    const usageConditions = [eq(coupons.id, coupon.id), eq(coupons.active, true)];
    if (coupon.maxUses !== null) usageConditions.push(lt(coupons.uses, coupon.maxUses));
    if (coupon.expiresAt) usageConditions.push(gt(coupons.expiresAt, new Date()));
    const [reservedCoupon] = await db.update(coupons)
      .set({ uses: sql`${coupons.uses} + 1` })
      .where(and(...usageConditions))
      .returning({ id: coupons.id });
    if (!reservedCoupon) throw new Error("Coupon is expired, inactive, or has reached its usage limit");
    reservedCouponId = reservedCoupon.id;

    appliedCoupon = code;
  }

  let inserted: { id: number }[];
  try {
    inserted = await db.insert(orders).values(
      verifiedCart.map((item, idx) => ({
        productId: item.product.id,
        productColor: item.color,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerAddress: input.customerAddress,
        customerCity: input.customerCity,
        couponCode: appliedCoupon ?? null,
        discountAmount: idx === 0 ? discountAmount : 0,
        status: "pending",
      })),
    ).returning({ id: orders.id });
  } catch (error) {
    if (reservedCouponId !== undefined) {
      await db.update(coupons).set({ uses: sql`GREATEST(${coupons.uses} - 1, 0)` }).where(eq(coupons.id, reservedCouponId));
    }
    throw error;
  }

  return { orderIds: inserted.map((r) => r.id), discountAmount };
}

export async function validateCoupon(code: string, subtotal: number) {
  if (typeof code !== "string" || code.length > 50 || !Number.isSafeInteger(subtotal) || subtotal < 0) throw new Error("Invalid coupon request");
  const upper = code.trim().toUpperCase();
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, upper));
  if (!coupon || !coupon.active) throw new Error("Invalid or inactive coupon");
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new Error("Coupon has expired");
  if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) throw new Error("Usage limit reached");
  if (subtotal * 100 < coupon.minOrder) throw new Error(`Minimum order JMD ${(coupon.minOrder / 100).toFixed(2)} required`);

  const discount = coupon.type === "percent"
    ? Math.round((subtotal * coupon.amount) / 100)
    : Math.min(Math.round(coupon.amount / 100), subtotal);

  return { discount, type: coupon.type, amount: coupon.amount };
}
