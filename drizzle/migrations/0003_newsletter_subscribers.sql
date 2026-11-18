CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "email" varchar(255) NOT NULL UNIQUE,
  "consented_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "active" boolean NOT NULL DEFAULT true
);
