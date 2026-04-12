import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/server/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const session = await verifyToken(token);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({ authenticated: true, role: session.role, username: session.username });
}
