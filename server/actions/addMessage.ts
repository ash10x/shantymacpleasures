"use server";

import { db } from "../index";
import { messages } from "../schema";
import nodemailer from "nodemailer";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export async function POST(req: Request) {
  try {
    const data: ContactForm = await req.json();

    if (!data.name || !data.email || !data.message) {
      return new Response(JSON.stringify({ message: "All fields required" }), {
        status: 400,
      });
    }

    // 1️⃣ Insert into database
    await db.insert(messages).values({
      name: data.name,
      email: data.email,
      message: data.message,
    });

    // 2️⃣ Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 3️⃣ Send email to site owner
    await transporter.sendMail({
      from: `"${data.name}" <${data.email}>`,
      to: "shantymacpleasures@yahoo.com",
      subject: `New Contact Form Submission from ${data.name}`,
      html: `<p>${data.message}</p><p>From: ${data.name} &lt;${data.email}&gt;</p>`,
    });

    // 4️⃣ Send confirmation email to user
    await transporter.sendMail({
      from: `"Shanty Mac Pleasures" <shantymacpleasures@yahoo.com>`,
      to: data.email,
      subject: "We Received Your Message",
      html: `
        <p>Hi ${data.name},</p>
        <p>Thank you for reaching out! We’ve received your message and will get back to you shortly.</p>
        <p>— Shanty Mac Pleasures</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}
