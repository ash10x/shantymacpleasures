"use client";

import { useCart } from "../../context/cartContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ConfirmationPage() {
  const { cart, clearCart } = useCart();

  // ✅ STORE ORDER SNAPSHOT
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    if (cart.length > 0) {
      const total = cart.reduce(
        (acc: number, item: any) => acc + item.price * item.quantity,
        0,
      );

      setOrderItems(cart);
      setOrderTotal(total);

      clearCart(); // clear AFTER saving
    }
  }, []);

  return (
    <div className="min-h-screen bg-white py-32 px-6 relative overflow-hidden">
      {/* 🌫 Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/40 via-purple-100/30 to-white blur-3xl" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* SUCCESS ICON */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-3xl shadow-lg"
        >
          ✓
        </motion.div>

        {/* TITLE */}
        <motion.h1
          className="text-3xl md:text-4xl font-semibold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Order Confirmed
        </motion.h1>

        <p className="text-black/60 mb-10">
          Thank you for your purchase. Your order has been received and is being
          processed with discretion.
        </p>

        {/* ORDER SUMMARY */}
        <motion.div
          className="bg-white border border-black/10 rounded-2xl p-6 shadow-md text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-semibold mb-4">Order Summary</h2>

          {orderItems.length === 0 ? (
            <p className="text-black/60 text-sm">
              Your order has been successfully placed.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {orderItems.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>${item.price * item.quantity}</span>
                </div>
              ))}

              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>${orderTotal}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* ACTIONS */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sex-toys">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-md"
            >
              Continue Shopping
            </motion.button>
          </Link>

          <Link href="/">
            <button className="px-6 py-3 rounded-full border border-black/20 hover:bg-gray-100 transition">
              Back to Home
            </button>
          </Link>
        </div>

        {/* TRUST */}
        <p className="text-xs text-black/50 mt-8">
          🔒 Discreet packaging • Secure processing • Premium support
        </p>
      </div>
    </div>
  );
}
