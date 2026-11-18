"use server";

import db from "@/server/index";
import { newsletterSubscribers } from "@/server/schema";

export async function subscribeNewsletter(input: {
  email: string;
  consent: boolean;
  website?: string;
}): Promise<{ success: boolean; alreadySubscribed?: boolean; error?: string }> {
  if (!input || typeof input !== "object") {
    return { success: false, error: "Enter a valid email address and accept the privacy notice." };
  }

  // Quietly ignore simple bot submissions caught by the honeypot.
  if (typeof input.website === "string" && input.website.trim()) return { success: true };

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Enter a valid email address." };
  }
  if (input.consent !== true) {
    return { success: false, error: "Please agree to receive email updates." };
  }

  try {
    const inserted = await db
      .insert(newsletterSubscribers)
      .values({ email, consentedAt: new Date() })
      .onConflictDoNothing({ target: newsletterSubscribers.email })
      .returning({ id: newsletterSubscribers.id });

    return { success: true, alreadySubscribed: inserted.length === 0 };
  } catch (error) {
    console.error("[newsletter/subscribe] database operation failed", error instanceof Error ? error.name : "UnknownError");
    return { success: false, error: "We couldn’t add you right now. Please try again." };
  }
}
