import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

sql`SELECT column_name FROM information_schema.columns WHERE table_name='orders' ORDER BY ordinal_position`
  .then((cols) => { console.log("Orders columns:", cols.map((c: Record<string, string>) => c.column_name).join(", ")); process.exit(0); })
  .catch((e) => { console.error(e); process.exit(1); });
