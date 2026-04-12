import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),  // no unique — customers can message more than once
  message: text("message"),
  read: boolean().notNull().default(false),
  replied: boolean().notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  price: integer().notNull(),
  quantity: integer().notNull(),
  description: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 255 }).notNull(),
  imageAlt: varchar("image_alt", { length: 255 }),
  category: varchar({ length: 255 }).notNull(),
  featured: boolean().notNull().default(false),
  bestseller: boolean().notNull().default(false),
});

export const orders = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").notNull(),
  quantity: integer().notNull(),
  totalPrice: integer("total_price").notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerAddress: varchar("customer_address", { length: 500 }),
  customerCity: varchar("customer_city", { length: 255 }),
  couponCode: varchar("coupon_code", { length: 100 }),
  discountAmount: integer("discount_amount").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  code: varchar({ length: 50 }).notNull().unique(),
  type: varchar({ length: 20 }).notNull().default("percent"), // "percent" | "flat"
  amount: integer().notNull(), // percent 1-100 or cents
  minOrder: integer("min_order").notNull().default(0),
  maxUses: integer("max_uses"),
  uses: integer().notNull().default(0),
  active: boolean().notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 100 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar({ length: 20 }).notNull().default("admin"), // "super_admin" | "admin"
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull(),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const logs = pgTable("logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  action: varchar({ length: 255 }).notNull(),
  entity: varchar({ length: 100 }),
  entityId: integer("entity_id"),
  details: text("details"),
  performedBy: integer("performed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

