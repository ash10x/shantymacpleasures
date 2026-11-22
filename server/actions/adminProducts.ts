"use server";

import db from "../index";
import { orders, products } from "../schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "../lib/adminSession";
import { writeAuditLog } from "../lib/audit";

const DB_INTEGER_MAX = 2_147_483_647;
const EDITABLE_PRODUCT_FIELDS = ["name", "price", "quantity", "description", "image", "imageAlt", "category", "colors", "featured", "bestseller"] as const;

function pickProductFields(input: Partial<ProductInput>): Partial<ProductInput> {
  return Object.fromEntries(EDITABLE_PRODUCT_FIELDS
    .filter((field) => Object.hasOwn(input, field))
    .map((field) => [field, input[field]])) as Partial<ProductInput>;
}

function validateProduct(input: Partial<ProductInput>, partial = false) {
  const required = ["name", "price", "quantity", "description", "image", "category", "colors", "featured", "bestseller"] as const;
  if (!partial && required.some((key) => input[key] === undefined)) throw new Error("All required product fields must be provided");
  if (input.name !== undefined && (typeof input.name !== "string" || !input.name.trim() || input.name.trim().length > 255)) throw new Error("Product name must be 1–255 characters");
  if (input.price !== undefined && (!Number.isSafeInteger(input.price) || input.price < 0 || input.price > DB_INTEGER_MAX)) throw new Error("Price must be a valid non-negative whole USD amount");
  if (input.quantity !== undefined && (!Number.isSafeInteger(input.quantity) || input.quantity < 0 || input.quantity > DB_INTEGER_MAX)) throw new Error("Quantity must be a valid non-negative whole number");
  for (const [key, max] of [["description", 255], ["imageAlt", 255], ["category", 255]] as const) {
    const value = input[key];
    if (value !== undefined && (typeof value !== "string" || value.length > max || (key !== "imageAlt" && !value.trim()))) throw new Error(`${key} is invalid`);
  }
  if (input.image !== undefined) {
    if (typeof input.image !== "string" || input.image.length > 2048 || input.image !== input.image.trim()) throw new Error("Image must be a valid HTTPS URL up to 2,048 characters");
    try {
      const imageUrl = new URL(input.image);
      if (imageUrl.protocol !== "https:" || !imageUrl.hostname || imageUrl.username || imageUrl.password) throw new Error();
    } catch {
      throw new Error("Image must be a valid HTTPS URL");
    }
  }
  if (input.colors !== undefined && (!Array.isArray(input.colors) || input.colors.length > 20 || input.colors.some((color) => typeof color !== "string" || !color.trim() || color.trim().length > 80) || new Set(input.colors.map((color) => color.trim().toLocaleLowerCase())).size !== input.colors.length)) throw new Error("Colors must be a list of up to 20 unique names, each 1–80 characters");
  for (const key of ["featured", "bestseller"] as const) {
    if (input[key] !== undefined && typeof input[key] !== "boolean") throw new Error(`${key} must be true or false`);
  }
}

export type ProductInput = {
  name: string;
  price: number;
  quantity: number;
  description: string;
  image: string;
  imageAlt: string;
  category: string;
  colors: string[];
  featured: boolean;
  bestseller: boolean;
};

export async function createProduct(input: ProductInput) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  if (!input || typeof input !== "object") throw new Error("Invalid product data");
  const editable = pickProductFields(input);
  if (Object.keys(editable).length !== EDITABLE_PRODUCT_FIELDS.length) throw new Error("All required product fields must be provided");
  const productInput = editable as ProductInput;
  validateProduct(productInput);

  const [product] = await db.insert(products).values({ ...productInput, name: productInput.name.trim(), category: productInput.category.trim(), image: productInput.image.trim(), colors: productInput.colors.map((color) => color.trim()) }).returning();
  await writeAuditLog("CREATE_PRODUCT", "product", product.id, `Created "${product.name}"`, session.id);
  return product;
}

/** Import inventory rows, updating matching IDs and creating rows with missing IDs. */
export async function importProducts(rows: Array<{ id?: number; product: ProductInput }>) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 1000) throw new Error("Import must contain between 1 and 1,000 products");

  // Validate the complete file before writing any rows.
  for (const row of rows) {
    if (!row || typeof row !== "object" || !row.product || typeof row.product !== "object") throw new Error("Invalid product row");
    if (row.id !== undefined && (!Number.isSafeInteger(row.id) || row.id < 1)) throw new Error("Product IDs must be positive whole numbers");
    const editable = pickProductFields(row.product);
    if (Object.keys(editable).length !== EDITABLE_PRODUCT_FIELDS.length) throw new Error("Each row must include every product field");
    validateProduct(editable);
  }

  let created = 0;
  let updated = 0;
  for (const row of rows) {
    const productInput = { ...row.product, name: row.product.name.trim(), category: row.product.category.trim(), image: row.product.image.trim(), colors: row.product.colors.map((color) => color.trim()) };
    const [existing] = row.id === undefined
      ? []
      : await db.select({ id: products.id }).from(products).where(eq(products.id, row.id)).limit(1);

    if (existing) {
      const [product] = await db.update(products).set(productInput).where(eq(products.id, existing.id)).returning();
      await writeAuditLog("IMPORT_PRODUCT", "product", product.id, `Imported update for "${product.name}"`, session.id);
      updated++;
    } else {
      const [product] = await db.insert(products).values(productInput).returning();
      await writeAuditLog("IMPORT_PRODUCT", "product", product.id, `Imported new product "${product.name}"`, session.id);
      created++;
    }
  }
  return { created, updated };
}

export async function updateProduct(id: number, input: Partial<ProductInput>) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid product id");
  if (!input || typeof input !== "object") throw new Error("Invalid product data");
  input = pickProductFields(input);
  validateProduct(input, true);
  if (Object.keys(input).length === 0) throw new Error("No product fields to update");

  const [before] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!before) throw new Error("Product not found");
  const [product] = await db.update(products).set({ ...input, ...(input.name !== undefined ? { name: input.name.trim() } : {}), ...(input.category !== undefined ? { category: input.category.trim() } : {}), ...(input.image !== undefined ? { image: input.image.trim() } : {}), ...(input.colors !== undefined ? { colors: input.colors.map((color) => color.trim()) } : {}) }).where(eq(products.id, id)).returning();
  if (!product) throw new Error("Product not found");
  const changes: string[] = [];
  if (input.price !== undefined && input.price !== before.price) changes.push(`price USD ${before.price} → ${input.price}`);
  if (input.quantity !== undefined && input.quantity !== before.quantity) changes.push(`stock ${before.quantity} → ${input.quantity}`);
  if (input.name !== undefined && input.name.trim() !== before.name) changes.push("name changed");
  if (input.category !== undefined && input.category.trim() !== before.category) changes.push("category changed");
  if (input.colors !== undefined && input.colors.join(",") !== before.colors.join(",")) changes.push("available colors changed");
  await writeAuditLog("UPDATE_PRODUCT", "product", product.id, changes.length ? changes.join("; ") : `Updated "${product.name}"`, session.id);
  return product;
}

export async function deleteProduct(id: number) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid product id");
  const [existingOrder] = await db.select({ id: orders.id }).from(orders).where(eq(orders.productId, id)).limit(1);
  if (existingOrder) throw new Error("This product has order history and cannot be deleted");

  const [product] = await db.delete(products).where(eq(products.id, id)).returning();
  if (!product) throw new Error("Product not found");
  await writeAuditLog("DELETE_PRODUCT", "product", id, `Deleted "${product.name}"`, session.id);
  return product;
}
