import { NextResponse } from "next/server";
import { getAdminSession } from "@/server/lib/adminSession";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({ authenticated: true, role: session.role, username: session.username });
}
