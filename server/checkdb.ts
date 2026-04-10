import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

Promise.all([
  sql`UPDATE products SET bestseller = true WHERE id IN (1, 2, 6)`,
  sql`UPDATE products SET featured = true WHERE id IN (3, 4, 5, 7)`,
])
  .then(() => { console.log("Done"); process.exit(0); })
  .catch((e) => { console.error(e); process.exit(1); });
