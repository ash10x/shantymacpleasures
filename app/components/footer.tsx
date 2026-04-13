"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Facebook, Music2 } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

/* ================= SOCIAL LINKS ================= */
const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://www.instagram.com/shantymacpleasures",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://facebook.com/shantymacpleasures",
  },
  {
    name: "TikTok",
    icon: Music2,
    url: "https://www.tiktok.com/@shantymacpleasures",
  },
];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ================= HIDE ON ADMIN ================= */
  if (pathname.startsWith("/admin")) return null;

  /* ================= NEWSLETTER SUBMIT ================= */
  const handleSubscribe = async () => {
    if (!email) return;

    try {
      setLoading(true);

      // TODO: connect to API / Mailchimp / Resend
      await new Promise((res) => setTimeout(res, 1200));

      setSuccess(true);
      setEmail("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="mt-24 bg-gradient-to-br from-[#fb3aa3] via-[#d91e8c] to-[#a40f6b] text-white">
      {/* TOP */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-12">
        {/* BRAND */}
        <div className="space-y-4">
          <Image
            src="/logo/logowhite.png"
            alt="ShantyMac Pleasures"
            width={90}
            height={90}
            className="opacity-90"
          />

          <p className="text-white/80 text-sm leading-relaxed">
            Elevating intimacy with luxury, discretion, and pleasure-first
            design.
          </p>

          {/* SOCIALS */}
          <div className="flex gap-4 pt-2">
            {socialLinks.map((social, i) => {
              const Icon = social.icon;

              return (
                <motion.a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                  aria-label={social.name}
                >
                  <Icon size={18} />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* SHOP */}
        <div>
          <h3 className="font-semibold mb-4 tracking-wide">Shop</h3>
          <div className="flex flex-col gap-3 text-sm text-white/80">
            {[
              { name: "Sex Toys", href: "/sex-toys" },
              { name: "Lingerie", href: "/lingerie" },
              { name: "Accessories", href: "/accessories" },
              { name: "For Couples", href: "/couples" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="hover:text-white hover:translate-x-1 transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* COMPANY */}
        <div>
          <h3 className="font-semibold mb-4 tracking-wide">Company</h3>
          <div className="flex flex-col gap-3 text-sm text-white/80">
            {[
              { name: "Home", href: "/" },
              { name: "About Us", href: "/about" },
              { name: "Contact", href: "/contact" },
              { name: "Privacy Policy", href: "/privacy" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="hover:text-white hover:translate-x-1 transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* NEWSLETTER */}
        <div>
          <h3 className="font-semibold mb-4 tracking-wide">Stay Connected</h3>

          <p className="text-sm text-white/80 mb-4">
            Get exclusive drops, private deals & intimate tips.
          </p>

          <div className="flex bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 bg-transparent outline-none text-sm placeholder:text-white/50"
            />

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-white text-pink-600 px-5 text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50"
            >
              {loading ? "..." : "Join"}
            </button>
          </div>

          {success && (
            <p className="text-xs text-green-200 mt-2">
              You're in. Check your inbox 💌
            </p>
          )}
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-white/20" />

      {/* BOTTOM */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-white/70">
        <p>
          © {new Date().getFullYear()} ShantyMac Pleasures. All rights reserved.
        </p>

        <div className="flex gap-6 mt-3 md:mt-0">
          {[
            { name: "Terms", href: "/terms" },
            { name: "Privacy", href: "/privacy" },
            { name: "Shipping", href: "/shipping" },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="hover:text-white transition"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
