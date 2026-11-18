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

  return <footer className="mt-0 bg-[#2b1238] text-[#fbf7f1]">
    <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.3fr_0.8fr_1fr] md:px-10 md:py-20">
      <div className="space-y-5"><Link href="/" aria-label="ShantyMac Pleasures home"><Image src="/logo/logowhite.png" alt="ShantyMac Pleasures" width={90} height={90} className="opacity-90" /></Link><p className="max-w-sm text-sm leading-7 text-white/65">A considered collection for confidence, connection, and the rituals that are entirely your own.</p><div className="flex gap-3 pt-1">{socials.map(([name, Icon, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 p-2.5 text-white/75 transition hover:border-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={`${name} (opens in a new tab)`}><Icon size={17} /></a>)}</div></div>
      <div><h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff78c4]">Explore</h2><nav aria-label="Footer navigation" className="flex flex-col gap-3 text-sm text-white/75"><Link className="hover:text-white" href="/shop">Shop all</Link><Link className="hover:text-white" href="/about">Our story</Link><Link className="hover:text-white" href="/contact">Contact</Link><Link className="hover:text-white" href="/shipping">Shipping & returns</Link><Link className="hover:text-white" href="/terms">Terms & conditions</Link><Link className="hover:text-white" href="/privacy">Privacy policy</Link></nav></div>
      <div><h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff78c4]">Get in touch</h2><p className="mb-4 text-sm text-white/65">Montego Bay, Jamaica</p><a className="block break-all text-sm underline decoration-white/35 underline-offset-4 hover:text-white" href="mailto:shantymacpleasures@yahoo.com">shantymacpleasures@yahoo.com</a><a className="mt-3 block text-sm underline decoration-white/35 underline-offset-4 hover:text-white" href="tel:+18763121862">+1 876 312 1862</a></div>
    </div>
    <div className="border-t border-white/15"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-white/55 md:flex-row md:items-center md:justify-between md:px-10"><p>© {new Date().getFullYear()} ShantyMac Pleasures. All rights reserved.</p><p>Montego Bay, Jamaica</p></div></div>
  </footer>;
}
