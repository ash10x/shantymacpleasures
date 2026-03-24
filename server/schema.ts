import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  message: varchar({ length: 255 }).notNull(),
});

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  price: integer().notNull(),
  quantity: integer().notNull(),
  description: varchar({ length: 255 }).notNull(),
});
