"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Music2 } from "lucide-react";
import Image from "next/image";

/* ================= SOCIAL LINKS ================= */
const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://www.instagram.com/shantymacpleasures?igsh=dTZhaDRiZHFjM2Vt",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://facebook.com/shantymacpleasures",
  },
  {
    name: "TikTok",
    icon: Music2,
    url: "https://www.tiktok.com/%40shantymacpleasures?_t=ZM-8v3wzyZVVpu&_r=1&fbclid=PAb21jcARGru1leHRuA2FlbQIxMQBzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAafW2T57gPO-CdwQznizDW7o4HIGAgp37pid2Cvvz32_DJ9HtnCdfCEvsq3-yg_aem_8zDgjoVBA_aFKNR0QkCnEQ",
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-[#fb3aa3] text-white">
      {/* TOP */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
        {/* BRAND */}
        <div>
          <Image
            src="/logo/logowhite.png"
            alt="ShantyMac Pleasures"
            width={90}
            height={90}
          />

          <p className="text-white/80 text-sm leading-relaxed">
            Elevating intimacy with luxury, discretion, and pleasure-first
            design.
          </p>

          {/* SOCIALS */}
          <div className="flex gap-4 mt-6">
            {socialLinks.map((social, i) => {
              const Icon = social.icon;

              return (
                <motion.a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2 }}
                  className="cursor-pointer hover:text-white/80 transition"
                  aria-label={social.name}
                >
                  <Icon />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* SHOP */}
        <div>
          <h3 className="font-semibold mb-4">Shop</h3>
          <div className="flex flex-col gap-3 text-sm text-white/80">
            <Link href="/sex-toys">Sex Toys</Link>
            <Link href="/lingerie">Lingerie</Link>
            <Link href="/accessories">Accessories</Link>
            <Link href="/couples">For Couples</Link>
          </div>
        </div>

        {/* COMPANY */}
        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <div className="flex flex-col gap-3 text-sm text-white/80">
            <Link href="/">Home</Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>

        {/* NEWSLETTER */}
        <div>
          <h3 className="font-semibold mb-4">Stay Connected</h3>
          <p className="text-sm text-white/80 mb-4">
            Get exclusive drops, offers & intimate tips.
          </p>

          <div className="flex bg-white/10 backdrop-blur-md rounded-lg overflow-hidden">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
            />
            <button className="bg-white text-pink-600 px-4 text-sm font-medium hover:bg-gray-100 transition">
              Join
            </button>
          </div>
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
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/shipping">Shipping</Link>
        </div>
      </div>
    </footer>
  );
}
