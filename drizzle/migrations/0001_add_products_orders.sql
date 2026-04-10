-- Create products table (includes featured & bestseller columns)
CREATE TABLE IF NOT EXISTS "products" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "name" varchar(255) NOT NULL,
  "price" integer NOT NULL,
  "quantity" integer NOT NULL,
  "description" varchar(255) NOT NULL,
  "image" varchar(255) NOT NULL,
  "category" varchar(255) NOT NULL,
  "featured" boolean DEFAULT false NOT NULL,
  "bestseller" boolean DEFAULT false NOT NULL
);

-- Add columns in case the table already existed without them
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false NOT NULL;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "bestseller" boolean DEFAULT false NOT NULL;

-- Create orders table
CREATE TABLE IF NOT EXISTS "orders" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "product_id" integer NOT NULL,
  "quantity" integer NOT NULL,
  "total_price" integer NOT NULL,
  "customer_name" varchar(255) NOT NULL,
  "customer_email" varchar(255) NOT NULL
);
