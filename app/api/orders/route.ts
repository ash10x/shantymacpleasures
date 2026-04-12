import { NextRequest, NextResponse } from "next/server";
import db from "@/server/index";
import { orders } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email || !email.includes("@")) {
    return NextResponse.json({ message: "Valid email required" }, { status: 400 });
  }

  const rows = await db
    .select({
      id: orders.id,
      productId: orders.productId,
      quantity: orders.quantity,
      totalPrice: orders.totalPrice,
      discountAmount: orders.discountAmount,
      couponCode: orders.couponCode,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerEmail, email));
  return NextResponse.json({ orders: rows });
}
