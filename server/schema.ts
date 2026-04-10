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
  email: varchar("email", { length: 255 }),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  price: integer().notNull(),
  quantity: integer().notNull(),
  description: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 255 }).notNull(),
  featured: boolean().notNull().default(false),
  bestseller: boolean().notNull().default(false),
});

export const orders = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  productId: integer().notNull(),
  quantity: integer().notNull(),
  totalPrice: integer().notNull(),
  customerName: varchar({ length: 255 }).notNull(),
  customerEmail: varchar({ length: 255 }).notNull(),
});
