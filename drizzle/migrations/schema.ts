import { pgTable, integer, varchar, text, timestamp, boolean, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const orders = pgTable("orders", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "orders_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	productId: integer().notNull(),
	quantity: integer().notNull(),
	totalPrice: integer().notNull(),
	customerName: varchar({ length: 255 }).notNull(),
	customerEmail: varchar({ length: 255 }).notNull(),
});

export const messages = pgTable("messages", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "messages_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	message: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const products = pgTable("products", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "products_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	price: integer().notNull(),
	quantity: integer().notNull(),
	description: varchar({ length: 255 }).notNull(),
	image: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 255 }).notNull(),
	featured: boolean().default(false).notNull(),
	bestseller: boolean().default(false).notNull(),
});

export const logs = pgTable("logs", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "logs_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	action: varchar({ length: 255 }).notNull(),
	entity: varchar({ length: 100 }),
	entityId: integer("entity_id"),
	details: text(),
	performedBy: integer("performed_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	username: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	role: varchar({ length: 20 }).default('admin').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);
