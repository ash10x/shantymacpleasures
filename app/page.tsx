"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/cartContext";
import { useState } from "react";

/* ================= DATA ================= */
const products = [
  {
    id: 1,
    name: "Rose Luxe Vibrator",
    price: 49,
    image: "/products/rose1.jpg",
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Mini Wand Vibrator",
    price: 29,
    image: "/products/vibrator.jpg",
  },
  {
    id: 3,
    name: "White Strap-On",
    price: 79,
    image: "/products/whitestrapon.jpg",
    badge: "Trending",
  },
];

const featured = [
  {
    id: 10,
    name: "Luxury Glass Dildo",
    price: 59,
    image: "/products/glass.jpg",
  },
  {
    id: 11,
    name: "Rechargeable Bullet",
    price: 19,
    image: "/products/bullet.jpg",
  },
];

const comingSoon = [
  { id: 201, name: "Smart App-Control Vibrator", image: "/products/rose1.jpg" },
  { id: 202, name: "Luxury Couple Sync Set", image: "/products/vibrator.jpg" },
];

const bundles = [
  {
    id: 101,
    name: "Starter Kit",
    desc: "Perfect introduction to premium pleasure",
    price: 89,
  },
  {
    id: 102,
    name: "Couples Kit",
    desc: "Designed for shared experiences",
    price: 129,
  },
];

export default function HomePage() {
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<number | null>(null);

  /* ===== PARALLAX (FIXED) ===== */
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 500], [0, 120]);
  const yContent = useTransform(scrollY, [0, 500], [0, -60]);

  const handleAdd = (item: any) => {
    addToCart(item);
    setAddedId(item.id);
    window.dispatchEvent(new Event("open-cart"));
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <main className="bg-white text-black overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="min-h-screen flex items-center justify-center text-center px-6 relative overflow-hidden">
        {/* Background with cinematic zoom */}
        <motion.div
          style={{ y: yBg, scale: 1.1 }}
          animate={{ scale: [1.1, 1.15, 1.1] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute inset-0"
        >
          <Image
            src="/images/bg1.jpg"
            alt="Luxury background"
            fill
            priority
            className="object-cover"
          />
        </motion.div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-purple-200/10 to-transparent" />

        {/* Premium glow */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute w-[28rem] h-[28rem] bg-pink-500/20 blur-[120px] rounded-full top-10 left-[-5rem]"
        />

        <motion.div
          animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute w-[28rem] h-[28rem] bg-purple-500/20 blur-[120px] rounded-full bottom-0 right-[-5rem]"
        />

        {/* Content */}
        <motion.div
          style={{ y: yContent }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-semibold leading-[1.1] text-white drop-shadow-xl"
          >
            Your Pleasure Is
            <span className="block bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              Our Business
            </span>
          </motion.h1>

          <p className="mt-6 text-white/80 max-w-xl mx-auto">
            Discover a curated collection of intimate products designed to
            elevate your experience with elegance and discretion.
          </p>

          <Link href="/shop">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full shadow-xl hover:shadow-pink-400/50"
            >
              Explore Collection
            </motion.button>
          </Link>

          {/* Trust */}
          <div className="mt-6 flex justify-center gap-5 text-xs text-white/70">
            <span>🔒 Discreet Shipping</span>
            <span>💳 Secure Checkout</span>
            <span>⚡ Fast Delivery</span>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-6 flex flex-col items-center text-white/70 text-xs"
        >
          <span>Scroll</span>
          <span className="text-lg">↓</span>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ================= FEATURED ================= */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10">
          Featured Products
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {featured.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border shadow-sm hover:shadow-lg transition"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={400}
                height={300}
                className="rounded-xl object-cover"
              />
              <h3 className="mt-4 font-semibold">{item.name}</h3>
              <p className="text-black/60">${item.price}</p>
              <button className="mt-3 text-sm text-pink-600 hover:underline">
                View Product →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-12">
          Bestsellers
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -8 }}
              className="group relative bg-white border rounded-2xl p-4 shadow-sm hover:shadow-xl"
            >
              {product.badge && (
                <span className="absolute top-3 left-3 bg-pink-500 text-white text-xs px-3 py-1 rounded-full">
                  {product.badge}
                </span>
              )}

              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={300}
                className="rounded-xl h-52 object-cover"
              />

              <h3 className="mt-4 font-semibold">{product.name}</h3>
              <p className="text-black/60 text-sm">${product.price}</p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                animate={addedId === product.id ? { scale: [1, 1.15, 1] } : {}}
                onClick={() => handleAdd(product)}
                className={`mt-4 w-full py-2 rounded-lg ${
                  addedId === product.id
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                }`}
              >
                {addedId === product.id ? "✓ Added" : "Add to Cart"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= BUNDLES ================= */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-12">
          Curated Bundles
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="p-6 rounded-2xl border shadow-sm hover:shadow-xl bg-gradient-to-br from-white to-pink-50"
            >
              <h3 className="text-xl font-semibold">{bundle.name}</h3>
              <p className="text-black/60 mt-2">{bundle.desc}</p>
              <p className="mt-4 font-semibold">${bundle.price}</p>
              <button className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full">
                View Bundle
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================= COMING SOON ================= */}
      <section className="py-24 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-12">Coming Soon</h2>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {comingSoon.map((item) => (
            <div key={item.id}>
              <Image
                src={item.image}
                alt={item.name}
                width={500}
                height={350}
                className="rounded-2xl"
              />
              <p className="mt-4 text-xl">{item.name}</p>
            </div>
          ))}
        </div>

        <button className="mt-12 bg-white text-black px-6 py-3 rounded-full">
          Join Waitlist
        </button>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 text-center">
        <h2 className="text-4xl font-semibold">
          Discover What You’ve Been Missing
        </h2>
        <Link href="/shop">
          <button className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full">
            Start Exploring
          </button>
        </Link>
      </section>
    </main>
  );
}
