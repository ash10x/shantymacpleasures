import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/server/index";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import { signToken } from "@/server/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({ id: user.id, username: user.username, role: user.role });

    const res = NextResponse.json({ ok: true, role: user.role, username: user.username });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
