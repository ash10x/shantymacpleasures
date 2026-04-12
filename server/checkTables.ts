import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  const result = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  console.log("Tables:", result.map((r: any) => r.table_name));
}

main().catch(console.error);
