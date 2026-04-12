"use client";

import { motion } from "framer-motion";
import { useCart } from "../../context/cartContext";

interface Props {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function AddToCartButton({ id, name, price, image, quantity }: Props) {
  const { addToCart } = useCart();
  const outOfStock = quantity === 0;

  return (
    <motion.button
      whileTap={outOfStock ? undefined : { scale: 0.95 }}
      whileHover={outOfStock ? undefined : { scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      disabled={outOfStock}
      onClick={() => {
        if (outOfStock) return;
        addToCart({ id, name, price, image });
        window.dispatchEvent(new Event("open-cart"));
      }}
      className={`w-full py-3 rounded-xl transition-all duration-300 font-medium ${
        outOfStock
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-linear-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-pink-300/40"
      }`}
    >
      {outOfStock ? "Out of Stock" : "Add to Cart"}
    </motion.button>
  );
}
