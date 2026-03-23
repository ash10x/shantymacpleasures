"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/app/context/cartContext";
import { useState } from "react";

/* ================= MOCK PRODUCTS ================= */
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

/* ================= BUNDLES ================= */
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

  const handleAdd = (item: any) => {
    addToCart(item);
    setAddedId(item.id);

    window.dispatchEvent(new Event("open-cart"));

    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <main className="bg-white text-black overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
        {/* 🔥 Background Image (animated) */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1.05, 1.1, 1.05] }}
          transition={{ duration: 20, repeat: Infinity }}
        >
          <img
            src="/images/bg1.jpg"
            className="w-full h-full object-cover"
            alt="Luxury background"
          />
        </motion.div>

        {/* 🎨 Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-pink-100/50 to-purple-100/50" />

        {/* ✨ Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-purple-200/20 to-transparent blur-3xl" />

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col items-center max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-semibold max-w-3xl leading-tight"
          >
            Your Pleasure Is
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Our Business
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-black/70 max-w-xl text-sm md:text-base leading-relaxed"
          >
            Discover a curated collection of intimate products designed to
            elevate your experience with elegance and discretion.
          </motion.p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/shop">
              <button className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-pink-200 transition">
                Explore Collection
              </button>
            </Link>
          </motion.div>
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
              className="group relative bg-white border border-black/10 rounded-2xl p-4 shadow-sm hover:shadow-xl transition"
            >
              {product.badge && (
                <span className="absolute top-3 left-3 bg-pink-500 text-white text-xs px-2 py-1 rounded-full z-20">
                  {product.badge}
                </span>
              )}

              <div className="overflow-hidden rounded-xl">
                <img
                  src={product.image}
                  className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <h3 className="mt-4 font-semibold">{product.name}</h3>
              <p className="text-black/60 text-sm">${product.price}</p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                animate={
                  product.id === 1
                    ? {
                        boxShadow: [
                          "0 0 0px rgba(236,72,153,0)",
                          "0 0 12px rgba(236,72,153,0.35)",
                          "0 0 0px rgba(236,72,153,0)",
                        ],
                      }
                    : {}
                }
                transition={
                  product.id === 1 ? { repeat: Infinity, duration: 2 } : {}
                }
                onClick={() =>
                  handleAdd({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  })
                }
                className={`mt-4 w-full py-2 rounded-lg shadow-md transition ${
                  addedId === product.id
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-pink-200/40"
                }`}
              >
                {addedId === product.id ? "Added ✓" : "Add to Cart"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= BUNDLES ================= */}
      <section className="py-24 px-6 bg-gradient-to-r from-pink-50 to-purple-50">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-14">
          Curated Bundles
        </h2>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
          {bundles.map((bundle) => (
            <motion.div
              key={bundle.id}
              whileHover={{ scale: 1.04 }}
              className="p-8 bg-white rounded-2xl border border-black/10 shadow-sm hover:shadow-xl transition"
            >
              <h3 className="text-lg font-semibold">{bundle.name}</h3>
              <p className="text-black/60 text-sm mt-2">{bundle.desc}</p>

              <p className="mt-4 font-semibold text-xl">${bundle.price}</p>

              <button
                onClick={() =>
                  handleAdd({
                    id: bundle.id,
                    name: bundle.name,
                    price: bundle.price,
                    image: "/images/bundle.jpg",
                  })
                }
                className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg shadow-md hover:shadow-pink-200 transition"
              >
                Get Bundle
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= TRUST ================= */}
      <section className="py-20 text-center px-6">
        <div className="flex flex-wrap justify-center gap-8 text-sm text-black/60">
          <span>🔒 Discreet Packaging</span>
          <span>🚚 Fast Delivery</span>
          <span>💳 Secure Checkout</span>
          <span>✔ Body-Safe Materials</span>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
          Discover What You’ve Been Missing
        </h2>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Link href="/shop">
            <button className="mt-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full shadow-lg hover:shadow-pink-200 transition">
              Start Exploring
            </button>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
