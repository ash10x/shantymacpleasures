/**
 * Applies incremental schema changes directly via @neondatabase/serverless.
 * Run with: npx tsx server/migrate.ts
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Applying schema migrations…");

  // 0002 – password_reset_tokens (idempotent)
  await sql`
    CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "user_id" integer NOT NULL,
      "token_hash" varchar(128) NOT NULL,
      "expires_at" timestamp NOT NULL,
      "used_at" timestamp,
      "created_at" timestamp DEFAULT now(),
      CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx" ON "password_reset_tokens" ("user_id")`;
  await sql`CREATE INDEX IF NOT EXISTS "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" ("expires_at")`;

  // 0003 – remove messages.email unique constraint
  await sql`ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_email_unique`;

  // 0004 – add image_alt to products
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_alt varchar(255)`;

  // 0005 – extend orders table
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address varchar(500)`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_city varchar(255)`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code varchar(100)`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount integer NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS status varchar(50) NOT NULL DEFAULT 'pending'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now()`;
  // rename camelCase cols to snake_case (safe no-op if already correct)
  await sql`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='productId') THEN
      ALTER TABLE orders RENAME COLUMN "productId" TO "product_id";
    END IF;
  END $$`;
  await sql`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='totalPrice') THEN
      ALTER TABLE orders RENAME COLUMN "totalPrice" TO "total_price";
    END IF;
  END $$`;
  await sql`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customerName') THEN
      ALTER TABLE orders RENAME COLUMN "customerName" TO "customer_name";
    END IF;
  END $$`;
  await sql`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customerEmail') THEN
      ALTER TABLE orders RENAME COLUMN "customerEmail" TO "customer_email";
    END IF;
  END $$`;

  // 0006 – coupons table
  await sql`
    CREATE TABLE IF NOT EXISTS "coupons" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "code" varchar(50) NOT NULL,
      "type" varchar(20) NOT NULL DEFAULT 'percent',
      "amount" integer NOT NULL,
      "min_order" integer NOT NULL DEFAULT 0,
      "max_uses" integer,
      "uses" integer NOT NULL DEFAULT 0,
      "active" boolean NOT NULL DEFAULT true,
      "expires_at" timestamp,
      "created_at" timestamp DEFAULT now(),
      CONSTRAINT "coupons_code_unique" UNIQUE("code")
    )
  `;

  // 0007 – consent-based newsletter subscriptions
  await sql`
    CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "email" varchar(255) NOT NULL UNIQUE,
      "consented_at" timestamp NOT NULL DEFAULT now(),
      "created_at" timestamp NOT NULL DEFAULT now(),
      "active" boolean NOT NULL DEFAULT true
    )
  `;

  // 0008 – support selectable product color variants and keep order selections.
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors text[] NOT NULL DEFAULT '{}'::text[]`;
  await sql`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='color') THEN
      UPDATE products SET colors = CASE WHEN btrim(color) = '' THEN '{}'::text[] ELSE ARRAY(SELECT btrim(value) FROM unnest(string_to_array(color, ',')) AS color_values(value) WHERE btrim(value) <> '') END WHERE cardinality(colors) = 0;
      ALTER TABLE products DROP COLUMN color;
    END IF;
  END $$`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_color varchar(255) NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE products ALTER COLUMN image TYPE text`;

  console.log("All migrations applied.");
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });

