import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import db from "@/server/index";
import { users, passwordResetTokens } from "@/server/schema";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ message: "Invalid reset token" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 12 || password.length > 1024) {
      return NextResponse.json({ message: "Password must be between 12 and 1024 characters." }, { status: 400 });
    }

    const tokenHash = hashToken(token);

    const [resetRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt),
        ),
      );

    if (!resetRecord) {
      return NextResponse.json({ message: "Reset link is invalid or expired." }, { status: 400 });
    }

    const [claimedToken] = await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(and(
        eq(passwordResetTokens.id, resetRecord.id),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ))
      .returning({ id: passwordResetTokens.id });
    if (!claimedToken) return NextResponse.json({ message: "Reset link is invalid or expired." }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);
    await db.update(users).set({ passwordHash }).where(eq(users.id, resetRecord.userId));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unable to reset password" }, { status: 500 });
  }
}
