"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { subscribeNewsletter } from "@/server/actions/subscribeNewsletter";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    startTransition(async () => {
      const result = await subscribeNewsletter({ email, consent, website });
      if (result.success) {
        setMessage(result.alreadySubscribed ? "You’re already on the list." : "Thank you. You’re on the list.");
        setEmail("");
        setConsent(false);
      } else setMessage(result.error ?? "We couldn’t add you right now. Please try again.");
    });
  };

  return <form onSubmit={submit} className="mt-7 max-w-xl">
    <label htmlFor="newsletter-email" className="sr-only">Email address</label>
    <div className="flex flex-col gap-3 sm:flex-row">
      <input id="newsletter-email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" className="min-w-0 flex-1 rounded-full border border-[#d7bbd7] bg-white px-5 py-3 text-sm text-[#2e2722] placeholder:text-[#8f857d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#662071]" />
      <button type="submit" disabled={isPending} className="rounded-full bg-[#2b1238] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#59443b] disabled:opacity-60">{isPending ? "Joining…" : "Join the list"}</button>
    </div>
    <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#695f58]"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-1 accent-[#662071]" /><span>I agree to receive occasional email updates. I can ask to stop at any time. Read our <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.</span></label>
    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label htmlFor="newsletter-website">Leave this field empty</label><input id="newsletter-website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></div>
    <p aria-live="polite" className="mt-3 min-h-5 text-sm text-[#59443b]">{message}</p>
  </form>;
}
