"use client";

import { motion } from "framer-motion";
import { useCart } from "../../context/cartContext";

interface Props {
  id: number;
  name: string;
  price: number;
  image: string;
}

export default function AddToCartButton({ id, name, price, image }: Props) {
  const { addToCart } = useCart();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      onClick={() => {
        addToCart({ id, name, price, image });
        window.dispatchEvent(new Event("open-cart"));
      }}
      className="w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl shadow-lg hover:shadow-pink-300/40 transition-all duration-300 font-medium"
    >
      Add to Cart
    </motion.button>
  );
}
