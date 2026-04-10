"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/cartContext";
import { useState } from "react";
import type { products } from "@/server/schema";

type Product = typeof products.$inferSelect;

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

interface Props {
  bestsellers: Product[];
  featuredProducts: Product[];
}

export default function HomeClient({ bestsellers, featuredProducts }: Props) {
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<number | null>(null);

  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 500], [0, 120]);
  const yContent = useTransform(scrollY, [0, 500], [0, -60]);

  const handleAdd = (item: Product) => {
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
    setAddedId(item.id);
    window.dispatchEvent(new Event("open-cart"));
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <main className="bg-white text-black overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="min-h-screen flex items-center justify-center text-center px-6 relative overflow-hidden">
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

        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-br from-pink-200/20 via-purple-200/10 to-transparent" />

        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute w-md h-112 bg-pink-500/20 blur-[120px] rounded-full top-10 -left-20"
        />
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute w-md h-112 bg-purple-500/20 blur-[120px] rounded-full bottom-0 -right-20"
        />

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
            <span className="block bg-linear-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
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
              className="mt-8 bg-linear-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full shadow-xl hover:shadow-pink-400/50"
            >
              Explore Collection
            </motion.button>
          </Link>

          <div className="mt-6 flex justify-center gap-5 text-xs text-white/70">
            <span>🔒 Discreet Shipping</span>
            <span>💳 Secure Checkout</span>
            <span>⚡ Fast Delivery</span>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-6 flex flex-col items-center text-white/70 text-xs"
        >
          <span>Scroll</span>
          <span className="text-lg">↓</span>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-b from-transparent to-white" />
      </section>

      {/* ================= FEATURED ================= */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-10">
            Featured Products
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            {featuredProducts.slice(0, 2).map((item) => (
              <Link
                key={item.id}
                href={`/shop/${item.id}`}
                className="group relative bg-white rounded-3xl border border-black/8 shadow-md hover:shadow-2xl hover:shadow-pink-200/50 transition-all duration-500 overflow-hidden block"
              >
                {/* Image area with gradient bg */}
                <div className="relative bg-linear-to-br from-pink-50 to-purple-50 overflow-hidden h-56">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Bottom fade into card */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-white to-transparent" />
                </div>

                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                    {item.category}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                    {item.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xl font-bold bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                      ${item.price}
                    </p>
                    <span className="text-sm font-medium text-pink-600 group-hover:translate-x-1 transition-transform inline-block">
                      View Product →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ================= BESTSELLERS ================= */}
      {bestsellers.length > 0 && (
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-12">
            Bestsellers
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {bestsellers.slice(0, 3).map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group relative bg-white rounded-3xl border border-black/8 shadow-md hover:shadow-2xl hover:shadow-pink-200/60 transition-shadow duration-500 overflow-hidden"
              >
                {/* Badge */}
                <span className="absolute top-3 left-3 z-10 bg-linear-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  🔥 Bestseller
                </span>

                {/* Image area */}
                <Link href={`/shop/${product.id}`}>
                  <div className="relative bg-linear-to-br from-pink-50 to-purple-50 h-52 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-5 group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white to-transparent" />
                  </div>
                </Link>

                {/* Info */}
                <div className="p-5">
                  <Link href={`/shop/${product.id}`}>
                    <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors leading-snug">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs text-gray-400 uppercase tracking-wider">{product.category}</p>
                  <p className="mt-2 text-lg font-bold bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    ${product.price}
                  </p>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    animate={addedId === product.id ? { scale: [1, 1.12, 1] } : {}}
                    onClick={() => handleAdd(product)}
                    className={`mt-4 w-full py-2.5 rounded-xl font-medium text-sm shadow-md transition-all duration-300 ${
                      addedId === product.id
                        ? "bg-green-500 text-white shadow-green-200"
                        : "bg-linear-to-r from-pink-500 to-purple-600 text-white shadow-pink-200 hover:shadow-pink-300/60"
                    }`}
                  >
                    {addedId === product.id ? "✓ Added" : "Add to Cart"}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ================= BUNDLES ================= */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-12">
          Curated Bundles
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="p-6 rounded-2xl border shadow-sm hover:shadow-xl bg-linear-to-br from-white to-pink-50"
            >
              <h3 className="text-xl font-semibold">{bundle.name}</h3>
              <p className="text-black/60 mt-2">{bundle.desc}</p>
              <p className="mt-4 font-semibold">${bundle.price}</p>
              <button className="mt-4 bg-linear-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full">
                View Bundle
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================= COMING SOON ================= */}
      <section className="py-24 px-6 bg-linear-to-r from-pink-500 to-purple-600 text-white text-center">
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
          Discover What You&apos;ve Been Missing
        </h2>
        <Link href="/shop">
          <button className="mt-8 bg-linear-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full">
            Start Exploring
          </button>
        </Link>
      </section>
    </main>
  );
}

