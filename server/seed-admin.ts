import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);

  const hash = await bcrypt.hash("Admin@1234", 12);

  await sql`
    INSERT INTO users (username, email, password_hash, role)
    VALUES ('superadmin', 'dinoshand@gmail.com', ${hash}, 'super_admin')
    ON CONFLICT (email) DO NOTHING
  `;

  console.log("Super admin seeded. Email: dinoshand@gmail.com | Password: Admin@1234");
  console.log("Change this password immediately after first login!");
}

seed().catch(console.error);
