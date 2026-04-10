"use server";

import db from "../index";
import { products } from "../schema";
import { eq } from "drizzle-orm";

export async function getProducts() {
  return await db.select().from(products);
}

export async function getProductById(id: number) {
  const result = await db.select().from(products).where(eq(products.id, id));
  return result[0] ?? null;
}

export async function getBestsellers() {
  return await db.select().from(products).where(eq(products.bestseller, true));
}

export async function getFeaturedProducts() {
  return await db.select().from(products).where(eq(products.featured, true));
}
