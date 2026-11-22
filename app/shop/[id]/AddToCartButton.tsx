"use client";

import { motion } from "framer-motion";
import { useCart } from "../../context/cartContext";
import { useState } from "react";

interface Props {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  colors: string[];
}

export default function AddToCartButton({ id, name, price, image, quantity, colors }: Props) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState("");
  const outOfStock = quantity === 0;

  return (
    <div className="space-y-3">
    {colors.length > 0 && <label className="block text-sm font-medium text-gray-700">Choose a color
      <select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)} className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-3 focus:border-pink-500 focus:outline-none">
        <option value="">Select a color</option>
        {colors.map((color) => <option key={color} value={color}>{color}</option>)}
      </select>
    </label>}
    <motion.button
      whileTap={outOfStock ? undefined : { scale: 0.95 }}
      whileHover={outOfStock ? undefined : { scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      disabled={outOfStock || (colors.length > 0 && !selectedColor)}
      onClick={() => {
        if (outOfStock || (colors.length > 0 && !selectedColor)) return;
        addToCart({ id, name, price, image, color: selectedColor });
        window.dispatchEvent(new Event("open-cart"));
      }}
      className={`w-full py-3 rounded-xl transition-all duration-300 font-medium ${
        outOfStock || (colors.length > 0 && !selectedColor)
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-linear-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-pink-300/40"
      }`}
    >
      {outOfStock ? "Out of Stock" : colors.length > 0 && !selectedColor ? "Choose a Color" : "Add to Cart"}
    </motion.button>
    </div>
  );
}
