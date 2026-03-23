"use client";

import { useState } from "react";
import { useCart } from "../context/cartContext";
import { motion } from "framer-motion";
import Image from "next/image";

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
    <div className="max-w-7xl mx-auto px-6 py-36">
      <h1 className="text-3xl md:text-4xl font-semibold mb-10 text-center bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
        Shop Our Premium Collection
      </h1>

      {/* ================= FILTERS ================= */}
      <div className="flex justify-center gap-4 mb-14 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-pink-100"
            }`}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {currentProducts.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -6 }}
            className="group bg-white rounded-2xl border border-black/10 shadow-sm hover:shadow-xl transition overflow-hidden"
          >
            {/* IMAGE */}
            <div className="overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                className="object-contain p-6 group-hover:scale-105 transition duration-500"
              />
            </div>

            {/* INFO */}
            <div className="p-5 flex flex-col justify-between">
              <div>
                <h2 className="font-semibold text-gray-800">{product.name}</h2>
                <p className="text-black/60 text-sm mt-1">${product.price}</p>
              </div>

              {/* BUTTON */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  });

                  window.dispatchEvent(new Event("open-cart"));
                }}
                className="mt-5 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg shadow-md hover:shadow-pink-200/40 transition-all duration-300"
              >
                Add to Cart
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-14 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                page === currentPage
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-pink-100"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
