"use server";

import db from "../index";
import { messages } from "../schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "../lib/auth";
import { writeLog } from "./adminLogs";
import nodemailer from "nodemailer";

export async function getMessages() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await writeLog("VIEW_MESSAGES", "message", undefined, "Viewed messages inbox", session.id);
  return db.select().from(messages).orderBy(desc(messages.createdAt));
}

export async function markAsRead(id: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [msg] = await db
    .update(messages)
    .set({ read: true })
    .where(eq(messages.id, id))
    .returning();

  await writeLog("READ_MESSAGE", "message", id, `Marked message from "${msg?.name}" as read`, session.id);
  return msg;
}

export async function deleteMessage(id: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [msg] = await db.delete(messages).where(eq(messages.id, id)).returning();
  await writeLog("DELETE_MESSAGE", "message", id, `Deleted message from "${msg?.name}"`, session.id);
  return msg;
}

export async function replyToMessage(id: number, toEmail: string, toName: string, replyBody: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const adminEmail = process.env.SMTP_USER!;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: adminEmail, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Shanty Mac Pleasures" <${adminEmail}>`,
    to: toEmail,
    subject: `Re: Your message to Shanty Mac Pleasures`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#ec4899,#9333ea);padding:32px 40px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Shanty Mac Pleasures</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">A reply to your enquiry</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">Hi <strong>${toName}</strong>,</p>
            <div style="font-size:15px;color:#374151;line-height:1.6;white-space:pre-wrap;">${replyBody}</div>
            <p style="margin:24px 0 0;font-size:15px;color:#374151;">— The Shanty Mac Pleasures Team</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Shanty Mac Pleasures • Montego Bay, Jamaica</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  await db.update(messages).set({ read: true, replied: true }).where(eq(messages.id, id));
  await writeLog("REPLY_MESSAGE", "message", id, `Replied to "${toName}": ${replyBody}`, session.id);
}
