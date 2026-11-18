"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { products } from "@/server/schema";
import { formatMoney } from "@/server/lib/money";
import { useCurrency } from "@/app/context/currencyContext";
import { useCart } from "@/app/context/cartContext";
import NewsletterSignup from "@/app/components/NewsletterSignup";

type Product = typeof products.$inferSelect;
type Category = { name: string; image: string; alt: string };

export default function HomeClient({ featuredProducts, categories }: { featuredProducts: Product[]; categories: Category[] }) {
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  const reduceMotion = useReducedMotion();
  const [addedId, setAddedId] = useState<number | null>(null);
  const reveal = reduceMotion ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.55 } };

  const addProduct = (item: Product) => {
    if (item.quantity <= 0) return;
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
    setAddedId(item.id);
    window.dispatchEvent(new Event("open-cart"));
    window.setTimeout(() => setAddedId(null), 1600);
  };

  return <main className="overflow-hidden bg-[#faf8f5] text-[#2b1238]">
    <section className="relative bg-[#2b1238] text-[#fbf7f1] lg:min-h-[740px]">
      <div className="relative aspect-[16/9] w-full lg:absolute lg:inset-0 lg:aspect-auto">
        <Image src="/images/landing-hero.png" alt="A woman in lavender lingerie reclining in a warmly lit boudoir, with intimate accessories nearby" fill priority sizes="100vw" className="object-cover object-center opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#2b1238] lg:bg-gradient-to-r lg:from-[#2b1238]/95 lg:via-[#2b1238]/65 lg:via-45% lg:to-[#2b1238]/10" />
      </div>
      <div className="relative mx-auto flex max-w-7xl items-center px-6 py-3 lg:min-h-[740px] lg:px-10 lg:py-28">
        <motion.div {...(reduceMotion ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } })} className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.32em] text-[#ff78c4]">Montego Bay · Jamaica</p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Pleasure,<br /><span className="italic text-[#ff78c4]">reimagined.</span></h1>
          <p className="mt-7 max-w-md text-base leading-7 text-white/75 sm:text-lg">A considered collection for confidence, connection, and the rituals that are entirely your own.</p>
          <div className="mt-9 flex flex-wrap items-center gap-5"><Link href="/shop" className="inline-flex min-h-12 items-center rounded-full border border-[#ff78c4] bg-[#662071] px-7 text-sm font-semibold text-white transition hover:bg-[#8d287b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Explore the collection <span aria-hidden="true" className="ml-3">↗</span></Link><Link href="/about" className="text-sm text-white/80 underline decoration-white/40 underline-offset-4 hover:text-white">Our point of view</Link></div>
          <p className="mt-12 text-xs tracking-wide text-white/55">Thoughtfully selected. Always personal.</p>
        </motion.div>
      </div>
      <div className="pointer-events-none absolute bottom-0 z-10 h-12 w-full bg-gradient-to-t from-[#faf8f5] to-transparent lg:h-24" />
    </section>

    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-[1fr_1.3fr] md:items-end md:px-10 md:py-28">
      <motion.div {...reveal}><p className="text-xs uppercase tracking-[0.25em] text-[#76227e]">A more considered kind of pleasure</p><h2 className="mt-5 max-w-lg font-serif text-4xl leading-tight sm:text-5xl">Make room for what feels good.</h2></motion.div>
      <motion.p {...reveal} className="max-w-2xl text-base leading-8 text-[#62536a] md:justify-self-end">ShantyMac Pleasures brings together intimate essentials chosen with care. Discover a private, welcoming space to explore at your own pace, with thoughtful service from Montego Bay.</motion.p>
    </section>

    {categories.length > 0 && <section className="border-y border-[#ecd8e8] bg-[#faeaf3] py-20 md:py-24"><div className="mx-auto max-w-7xl px-6 md:px-10"><motion.div {...reveal} className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[0.25em] text-[#76227e]">Find your feeling</p><h2 className="mt-3 font-serif text-4xl">Shop by collection</h2></div><Link href="/shop" className="text-sm underline underline-offset-4">View the full collection</Link></motion.div><div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">{categories.slice(0, 6).map((category) => <motion.div key={category.name} {...reveal}><Link href={`/shop?category=${encodeURIComponent(category.name)}`} className="group block"><div className="relative aspect-[4/5] overflow-hidden bg-[#e8e0d7]"><Image src={category.image} alt={category.alt} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" /><h3 className="absolute bottom-5 left-5 right-3 font-serif text-xl text-white sm:text-2xl">{category.name}</h3></div></Link></motion.div>)}</div></div></section>}

    {featuredProducts.length > 0 && <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28"><motion.div {...reveal} className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[0.25em] text-[#76227e]">A few considered favorites</p><h2 className="mt-3 font-serif text-4xl">The Edit</h2></div><Link href="/shop" className="text-sm underline underline-offset-4">Discover all pieces</Link></motion.div><div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{featuredProducts.slice(0, 4).map((product) => <motion.article key={product.id} {...reveal} className="group min-w-0"><Link href={`/shop/${product.id}`} className="block"><div className="relative aspect-[4/5] overflow-hidden bg-[#f0ebe5]"><Image src={product.image} alt={product.imageAlt || product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-5 transition duration-500 group-hover:scale-[1.04]" />{product.quantity <= 0 && <span className="absolute left-3 top-3 bg-white/90 px-3 py-1 text-[10px] uppercase tracking-wider">Sold out</span>}</div><p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#76227e]">{product.category}</p><h3 className="mt-1 truncate text-sm font-medium sm:text-base">{product.name}</h3><p className="mt-2 text-sm">{formatMoney(product.price, currency)}</p></Link><button type="button" disabled={product.quantity <= 0} onClick={() => addProduct(product)} className="mt-3 min-h-10 w-full border border-[#d7bbd7] text-xs transition hover:border-[#2b1238] hover:bg-[#2b1238] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#662071] disabled:cursor-not-allowed disabled:opacity-50">{product.quantity <= 0 ? "Unavailable" : addedId === product.id ? "Added to bag" : "Add to bag"}</button></motion.article>)}</div></section>}

    <section className="bg-[#2b1238] py-20 text-[#fbf7f1] md:py-24"><div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-3 md:px-10">{[{ n: "01", title: "A personal choice", text: "Explore a thoughtfully selected range and choose what feels right for you." }, { n: "02", title: "Considered details", text: "Clear product information helps you browse with confidence." }, { n: "03", title: "Here in Jamaica", text: "A local business based in Montego Bay, ready to help with your questions." }].map((item) => <motion.div {...reveal} key={item.n} className="border-t border-white/20 pt-5"><p className="text-xs tracking-[0.2em] text-[#f32b9b]">{item.n}</p><h3 className="mt-5 font-serif text-2xl">{item.title}</h3><p className="mt-3 max-w-sm text-sm leading-7 text-white/65">{item.text}</p></motion.div>)}</div></section>

    <section className="grid bg-[#f4e2ee] md:grid-cols-2"><div className="relative aspect-square bg-[#f4e2ee]"><Image src="/images/discover-still-life.png" alt="Purple satin still life with intimate accessories, flowers, perfume, and candlelight" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" /></div><div className="flex items-center px-8 py-14 md:px-14 lg:px-20"><motion.div {...reveal}><p className="text-xs uppercase tracking-[0.25em] text-[#76227e]">Your space, your pace</p><h2 className="mt-5 max-w-md font-serif text-4xl leading-tight sm:text-5xl">A little more intention. A lot more you.</h2><p className="mt-5 max-w-md leading-7 text-[#62536a]">Discover pieces chosen to make exploration feel welcoming, personal, and beautifully your own.</p><Link href="/shop" className="mt-8 inline-flex min-h-12 items-center border-b border-[#2b1238] text-sm">Find your next favorite <span aria-hidden="true" className="ml-3">↗</span></Link></motion.div></div></section>

    <section className="mx-auto max-w-5xl px-6 py-20 text-center md:py-24"><p className="text-xs uppercase tracking-[0.25em] text-[#76227e]">Thoughtful service, close to home</p><h2 className="mt-4 font-serif text-4xl">An experience shaped around you.</h2><p className="mx-auto mt-5 max-w-2xl leading-7 text-[#62536a]">Questions before you choose? Our team is based in Montego Bay and happy to help.</p><div className="mt-7 flex flex-wrap justify-center gap-6 text-sm"><Link href="/shipping" className="underline underline-offset-4">Shipping information</Link><Link href="/contact" className="underline underline-offset-4">Get in touch</Link><Link href="/privacy" className="underline underline-offset-4">Privacy and discretion</Link></div></section>

    <section className="border-y border-[#ecd8e8] bg-[#faeaf3] px-6 py-16 md:py-20"><div className="mx-auto grid max-w-7xl gap-7 md:grid-cols-[1fr_1.2fr] md:items-center md:px-4"><div><p className="text-xs uppercase tracking-[0.25em] text-[#76227e]">Notes from ShantyMac</p><h2 className="mt-3 font-serif text-4xl">A little pleasure in your inbox.</h2><p className="mt-4 max-w-md text-sm leading-6 text-[#62536a]">Occasional collection notes and updates, shared only with your permission.</p></div><NewsletterSignup /></div></section>
  </main>;
}
