"use server";

import db from "../index";
import { orders, coupons, products } from "../schema";
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
  if (!Array.isArray(input.cart) || input.cart.length === 0 || input.cart.length > 50) throw new Error("Cart is empty or invalid");
  if (!input.customerName?.trim() || input.customerName.length > 255) throw new Error("Enter a valid name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customerEmail ?? "") || input.customerEmail.length > 255) throw new Error("Enter a valid email address");
  if (!input.customerAddress?.trim() || input.customerAddress.length > 500 || !input.customerCity?.trim() || input.customerCity.length > 255) throw new Error("Enter a valid shipping address");

  const quantities = new Map<number, number>();
  for (const item of input.cart) {
    if (!Number.isSafeInteger(item.id) || item.id < 1 || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error("Invalid product or quantity");
    quantities.set(item.id, (quantities.get(item.id) ?? 0) + item.quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > 99)) throw new Error("Invalid quantity");
  const authoritativeProducts = await db.select().from(products);
  const byId = new Map(authoritativeProducts.map((product) => [product.id, product]));
  const verifiedCart = [...quantities].map(([id, quantity]) => {
    const product = byId.get(id);
    if (!product) throw new Error("A product in your cart is no longer available");
    if (product.quantity < quantity) throw new Error(`${product.name} does not have enough stock`);
    if (!Number.isSafeInteger(product.price) || product.price < 0) throw new Error("Product price is invalid");
    return { product, quantity };
  });
  const subtotal = verifiedCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  if (!Number.isSafeInteger(subtotal)) throw new Error("Order total is invalid");

  let discountAmount = 0;
  let appliedCoupon: string | undefined;

  if (input.couponCode) {
    const code = input.couponCode.trim().toUpperCase();
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    if (!coupon || !coupon.active) throw new Error("Invalid or inactive coupon code");
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new Error("Coupon has expired");
    if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) throw new Error("Coupon usage limit reached");

    if (subtotal < coupon.minOrder) throw new Error(`Minimum order for this coupon is $${(coupon.minOrder / 100).toFixed(2)}`);

    discountAmount = coupon.type === "percent"
      ? Math.round((subtotal * coupon.amount) / 100)
      : Math.min(coupon.amount, subtotal);

    appliedCoupon = code;
  }

  const inserted = await db.insert(orders).values(
    verifiedCart.map((item, idx) => ({
      productId: item.product.id,
      quantity: item.quantity,
      totalPrice: item.product.price * item.quantity,
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
  if (typeof code !== "string" || code.length > 50 || !Number.isSafeInteger(subtotal) || subtotal < 0) throw new Error("Invalid coupon request");
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
