import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/server/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin/dashboard")) return NextResponse.next();

  const token = request.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin", request.url));

  const session = await verifyToken(token);
  if (!session) return NextResponse.redirect(new URL("/admin", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
