CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "user_id" integer NOT NULL,
  "token_hash" varchar(128) NOT NULL,
  "expires_at" timestamp NOT NULL,
  "used_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);

CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx"
  ON "password_reset_tokens" ("user_id");

CREATE INDEX IF NOT EXISTS "password_reset_tokens_expires_at_idx"
  ON "password_reset_tokens" ("expires_at");
