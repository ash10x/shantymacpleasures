import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/server/index";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import { signToken } from "@/server/lib/auth";

export async function POST(req: NextRequest) {
  let stage = "parse_request";
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }
    const { email, password } = body as { email?: unknown; password?: unknown };
    if (
      typeof email !== "string" || email.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" || password.length === 0 || password.length > 1024
    ) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const authSecret = process.env.AUTH_SECRET;
    stage = "validate_auth_configuration";
    if (!authSecret || new TextEncoder().encode(authSecret).length < 32) {
      console.error("[auth/login] AUTH_SECRET is missing or too short for HS256");
      return NextResponse.json({ message: "Authentication is temporarily unavailable" }, { status: 503 });
    }

    stage = "database_lookup";
    const [user] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase()));
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    stage = "password_verification";
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    stage = "session_signing";
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
  } catch (error) {
    const err = error as { name?: unknown; code?: unknown };
    console.error("[auth/login] failed", {
      stage,
      name: typeof err?.name === "string" ? err.name : "UnknownError",
      code: typeof err?.code === "string" ? err.code : undefined,
    });
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
