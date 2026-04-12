"use server";

import db from "../index";
import { products } from "../schema";
import { eq } from "drizzle-orm";
import { getSession } from "../lib/auth";
import { writeLog } from "./adminLogs";

export type ProductInput = {
  name: string;
  price: number;
  quantity: number;
  description: string;
  image: string;
  imageAlt: string;
  category: string;
  featured: boolean;
  bestseller: boolean;
};

export async function createProduct(input: ProductInput) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [product] = await db.insert(products).values(input).returning();
  await writeLog("CREATE_PRODUCT", "product", product.id, `Created "${product.name}"`, session.id);
  return product;
}

export async function updateProduct(id: number, input: Partial<ProductInput>) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [product] = await db.update(products).set(input).where(eq(products.id, id)).returning();
  await writeLog("UPDATE_PRODUCT", "product", product.id, `Updated "${product.name}"`, session.id);
  return product;
}

export async function deleteProduct(id: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [product] = await db.delete(products).where(eq(products.id, id)).returning();
  await writeLog("DELETE_PRODUCT", "product", id, `Deleted "${product?.name}"`, session.id);
  return product;
}
