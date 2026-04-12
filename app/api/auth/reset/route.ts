import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import db from "@/server/index";
import { users, passwordResetTokens } from "@/server/schema";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "A valid email is required" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));

    // Always return success-like response to avoid account enumeration.
    if (!user) {
      return NextResponse.json({ ok: true, message: "If that account exists, a reset link has been sent." });
    }

    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const origin = req.nextUrl.origin;
    const resetUrl = `${origin}/admin/reset-password?token=${rawToken}`;

    if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const sender = process.env.SMTP_FROM || process.env.SMTP_USER;
      await transporter.sendMail({
        from: `"Shanty Mac Pleasures" <${sender}>`,
        to: user.email,
        subject: "Reset your admin password",
        html: `<p>You requested a password reset.</p><p><a href=\"${resetUrl}\">Click here to reset your password</a></p><p>This link expires in 30 minutes.</p>`,
      });
    } else {
      console.warn("SMTP is not configured. Password reset link:", resetUrl);
    }

    return NextResponse.json({ ok: true, message: "If that account exists, a reset link has been sent." });
  } catch {
    return NextResponse.json({ message: "Unable to send reset link" }, { status: 500 });
  }
}
