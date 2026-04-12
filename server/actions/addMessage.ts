"use server";

import db from "../index";
import { messages } from "../schema";
import nodemailer from "nodemailer";

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function addMessage(data: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!data.name || !data.email || !data.message) {
    return { success: false, error: "All fields are required." };
  }
  if (data.name.length > 100 || data.email.length > 255 || data.message.length > 2000) {
    return { success: false, error: "Input exceeds maximum allowed length." };
  }
  if (!data.email.includes("@")) {
    return { success: false, error: "Invalid email address." };
  }

  // 1. Save to DB
  await db.insert(messages).values({
    name: data.name,
    email: data.email,
    message: data.message,
  });

  // 2. Configure transporter
  const adminEmail = process.env.SMTP_USER!;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 3. Notify admin
  await transporter.sendMail({
    from: `"Shanty Mac Pleasures" <${adminEmail}>`,
    to: adminEmail,
    subject: `New Contact: ${data.name}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#ec4899,#9333ea);padding:32px 40px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">New Contact Message</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Shanty Mac Pleasures Admin</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 0 20px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">From</p>
                  <p style="margin:0;font-size:15px;color:#111827;font-weight:600;">${escHtml(data.name)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 20px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Email</p>
                  <a href="mailto:${escHtml(data.email)}" style="margin:0;font-size:15px;color:#9333ea;text-decoration:none;">${escHtml(data.email)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 8px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Message</p>
                  <div style="background:#f9fafb;border-left:3px solid #ec4899;border-radius:0 8px 8px 0;padding:16px;margin-top:8px;font-size:15px;color:#374151;line-height:1.6;white-space:pre-wrap;">${escHtml(data.message)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Received via shantymacpleasures.com contact form
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  // 4. Confirmation to client
  await transporter.sendMail({
    from: `"Shanty Mac Pleasures" <${adminEmail}>`,
    to: data.email,
    subject: "We received your message - Shanty Mac Pleasures",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#ec4899,#9333ea);padding:40px 40px 32px;text-align:center;">
            <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:700;">Thank you, ${data.name}!</h1>
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;">We've received your message and will be in touch soon.</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
              Hi <strong>${escHtml(data.name)}</strong>,
            </p>
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
              Thank you for reaching out to us! We've received your message and our team will get back to you <strong>within 24 hours</strong>.
            </p>
            <!-- Summary box -->
            <div style="background:#fdf4ff;border:1px solid #f0abfc;border-radius:12px;padding:20px;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#9333ea;text-transform:uppercase;letter-spacing:0.8px;">Your message</p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${escHtml(data.message)}</p>
            </div>
            <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;">
              If you have any urgent questions, you can reach us directly at 
              <a href="mailto:dinoshand@gmail.com" style="color:#ec4899;text-decoration:none;font-weight:600;">dinoshand@gmail.com</a>.
            </p>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="https://shantymacpleasures.com/shop" style="display:inline-block;background:linear-gradient(135deg,#ec4899,#9333ea);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:50px;">
              Browse Our Collection →
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">Shanty Mac Pleasures • Montego Bay, Jamaica</p>
            <p style="margin:0;font-size:11px;color:#d1d5db;">This is an automated confirmation. Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  return { success: true };
}
