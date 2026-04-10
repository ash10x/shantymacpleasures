"use client";

import { useState } from "react";
import { useCart } from "../context/cartContext";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/* ================= PRODUCTS ================= */
const products = [
  {
    id: 1,
    name: "Rose Vibrator",
    price: 49,
    category: "Vibrator",
    image: "/products/rose1.jpg",
  },
  {
    id: 2,
    name: "White Strap-On",
    price: 89,
    category: "Dildos",
    image: "/products/whitestrapon.jpg",
  },
  {
    id: 3,
    name: "Mini Wand Vibrator",
    price: 69,
    category: "Vibrator",
    image: "/products/vibrator.jpg",
  },
  {
    id: 4,
    name: "Vibrator Panties",
    price: 19,
    category: "Accessories",
    image: "/products/rcvibratorpanties.jpg",
  },
  {
    id: 5,
    name: "Mini Rabbit Vibrator",
    price: 59,
    category: "Vibrator",
    image: "/products/rabbit-vibrator.png",
  },
  {
    id: 6,
    name: "Leather Paddle",
    price: 29,
    category: "Accessories",
    image: "/products/leather-paddle.png",
  },
  {
    id: 7,
    name: "Silk Robe",
    price: 79,
    category: "Lingerie",
    image: "/products/silk-robe.png",
  },
  {
    id: 8,
    name: "Couples Wand",
    price: 99,
    category: "Massager",
    image: "/products/couples-wand.png",
  },
];

const categories = ["All", "Vibrator", "Lingerie", "Massager", "Accessories"];
const ITEMS_PER_PAGE = 4;

export default function ShopPage() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="relative max-w-7xl mx-auto px-6 py-36 overflow-hidden">
      {/* ================= AMBIENT GLOW ================= */}
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute w-[30rem] h-[30rem] bg-pink-500/20 blur-[120px] rounded-full top-10 left-[-10rem]"
      />
      <motion.div
        animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute w-[30rem] h-[30rem] bg-purple-500/20 blur-[120px] rounded-full bottom-0 right-[-10rem]"
      />

      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-14"
      >
        <h1 className="text-3xl md:text-5xl font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Shop Our Premium Collection
        </h1>
        <p className="text-gray-500 mt-3 text-sm">
          Designed for pleasure. Crafted for confidence.
        </p>
      </motion.div>

      {/* ================= FILTERS ================= */}
      <div className="flex justify-center gap-4 mb-16 flex-wrap">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-200/40"
                : "bg-white/70 backdrop-blur text-gray-700 border border-black/10 hover:bg-pink-50"
            }`}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {currentProducts.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className="group relative bg-white rounded-3xl border border-black/8 shadow-md hover:shadow-2xl hover:shadow-pink-200/60 transition-shadow duration-500 overflow-hidden"
          >
            {/* IMAGE */}
            <Link href={`/shop/${product.id}`} className="block">
              <div className="relative bg-linear-to-br from-pink-50 to-purple-50 overflow-hidden h-52">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-5 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white to-transparent" />
              </div>
            </Link>

            {/* INFO */}
            <div className="p-5 flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                {product.category}
              </span>
              <Link href={`/shop/${product.id}`}>
                <h2 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors leading-snug">
                  {product.name}
                </h2>
              </Link>
              <p className="text-lg font-bold bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                ${product.price}
              </p>

              {/* BUTTON */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200 }}
                onClick={() => {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  });

                  window.dispatchEvent(new Event("open-cart"));
                }}
                className="mt-3 w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-2.5 rounded-xl text-sm font-medium shadow-md shadow-pink-200/40 hover:shadow-pink-300/60 transition-shadow duration-300"
              >
                Add to Cart
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-16 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                page === currentPage
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                  : "bg-white border border-black/10 text-gray-700 hover:bg-pink-50"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </motion.button>
          ))}
        </div>
      )}

      {/* ================= BOTTOM FADE ================= */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
    </div>
  );
}
