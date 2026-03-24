"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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

/* ================= FEATURED ================= */
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

/* ================= COMING SOON ================= */
const comingSoon = [
  {
    id: 201,
    name: "Smart App-Control Vibrator",
    image: "/products/rose1.jpg",
  },
  {
    id: 202,
    name: "Luxury Couple Sync Set",
    image: "/products/vibrator.jpg",
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
        {/* Background */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1.05, 1.1, 1.05] }}
          transition={{ duration: 20, repeat: Infinity }}
        >
          <Image
            src="/images/bg1.jpg"
            alt="Luxury background"
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Premium overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-pink-100/30 to-purple-100/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-purple-200/20 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-semibold leading-[1.1] tracking-tight"
          >
            Your Pleasure Is
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Our Business
            </span>
          </motion.h1>

          <p className="mt-6 text-black/70 max-w-xl mx-auto">
            Discover a curated collection of intimate products designed to
            elevate your experience with elegance and discretion.
          </p>

          <Link href="/shop">
            <button className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-pink-200 transition">
              Explore Collection
            </button>
          </Link>

          <p className="mt-4 text-xs text-black/50">
            ⭐ Trusted by 1,000+ customers
          </p>
        </div>
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
              className="group relative bg-white border rounded-2xl p-4 shadow-sm hover:shadow-xl transition"
            >
              <div className="overflow-hidden rounded-xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <h3 className="mt-4 font-semibold">{product.name}</h3>
              <p className="text-black/60 text-sm">${product.price}</p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                animate={addedId === product.id ? { scale: [1, 1.1, 1] } : {}}
                onClick={() =>
                  handleAdd({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  })
                }
                className={`mt-4 w-full py-2 rounded-lg ${
                  addedId === product.id
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                }`}
              >
                {addedId === product.id ? "Added ✓" : "Add to Cart"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= COMING SOON ================= */}
      <section className="py-24 px-6 bg-linear-to-r from-pink-500 to-purple-600 text-white">
        <h2 className="text-4xl md:text-4xl font-bold text-center mb-12">
          Coming Soon
        </h2>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {comingSoon.map((item) => (
            <div key={item.id} className="relative group">
              <Image
                src={item.image}
                alt={item.name}
                width={500}
                height={350}
                className="rounded-2xl object-cover opacity-80 group-hover:opacity-100 transition"
              />

              {/* Overlay badge */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white text-black px-4 py-2 rounded-full text-sm shadow-md">
                  Coming Soon
                </span>
              </div>

              <p className="mt-4 font-semibold text-2xl text-center text-white/90">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-semibold">
          Discover What You’ve Been Missing
        </h2>

        <Link href="/shop">
          <button className="mt-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full shadow-lg">
            Start Exploring
          </button>
        </Link>
      </section>
    </main>
  );
}
