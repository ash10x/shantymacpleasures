"use client";

import { useState } from "react";
import { useCart } from "../context/cartContext";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const { cart } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const total = cart.reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0,
  );

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white py-32 px-6 relative overflow-hidden">
      {/* 🌫 Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/40 via-purple-100/30 to-white blur-3xl" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 relative z-10">
        {/* ================= FORM ================= */}
        <motion.div
          className="backdrop-blur-xl bg-white/70 border border-black/10 rounded-3xl p-8 shadow-xl"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Checkout Details</h2>

          {submitted ? (
            <div className="text-pink-500 font-semibold text-lg text-center">
              ✨ Order placed successfully
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
              />

              <input
                type="text"
                name="address"
                placeholder="Shipping Address"
                required
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
              />

              <input
                type="text"
                name="city"
                placeholder="City"
                required
                value={form.city}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
              />

              {/* 💎 CTA */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg shadow-md hover:shadow-pink-200/40 transition"
              >
                Complete Order
              </motion.button>

              {/* 🔒 TRUST */}
              <p className="text-xs text-black/50 text-center mt-2">
                🔒 Secure checkout • Discreet packaging guaranteed
              </p>
            </form>
          )}
        </motion.div>

        {/* ================= ORDER SUMMARY ================= */}
        <motion.div
          className="bg-white border border-black/10 rounded-3xl p-8 shadow-md"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Your Order</h2>

          {cart.length === 0 ? (
            <p className="text-black/60">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>${item.price * item.quantity}</span>
                </div>
              ))}

              <div className="border-t pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
