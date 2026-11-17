import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Order history is unavailable until customer accounts or secure order access links are configured." },
    { status: 401 },
  );
}
