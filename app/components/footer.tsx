"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Instagram, Facebook, Music2 } from "lucide-react";

const socials = [
  ["Instagram", Instagram, "https://www.instagram.com/shantymacpleasures"],
  ["Facebook", Facebook, "https://facebook.com/shantymacpleasures"],
  ["TikTok", Music2, "https://www.tiktok.com/@shantymacpleasures"],
] as const;

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return <footer className="mt-24 bg-gradient-to-br from-[#fb3aa3] via-[#d91e8c] to-[#a40f6b] text-white">
    <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
      <div className="space-y-4"><Image src="/logo/logowhite.png" alt="ShantyMac Pleasures" width={90} height={90} className="opacity-90"/><p className="text-white/80 text-sm leading-relaxed">Elevating intimacy with luxury, discretion, and pleasure-first design.</p><div className="flex gap-4 pt-2">{socials.map(([name, Icon, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition" aria-label={name}><Icon size={18}/></a>)}</div></div>
      <div><h2 className="font-semibold mb-4 tracking-wide">Explore</h2><div className="flex flex-col gap-3 text-sm text-white/80"><Link href="/shop">Shop All</Link><Link href="/about">About Us</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy Policy</Link></div></div>
      <div><h2 className="font-semibold mb-4 tracking-wide">Get in Touch</h2><p className="text-sm text-white/80 mb-3">Montego Bay, Jamaica</p><a className="block text-sm underline" href="mailto:shantymacpleasures@yahoo.com">shantymacpleasures@yahoo.com</a><a className="block mt-2 text-sm underline" href="tel:+18763121862">+1 876 312 1862</a></div>
    </div>
    <div className="border-t border-white/20"><div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-white/80"><p>© {new Date().getFullYear()} ShantyMac Pleasures. All rights reserved.</p><div className="flex gap-6 mt-3 md:mt-0"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/shipping">Shipping &amp; Returns</Link></div></div></div>
  </footer>;
}
