"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });

    // Optional: auto reset message after a few seconds
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-white py-36 px-6 relative overflow-hidden">
      {/* 🌫 Premium background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/40 via-purple-100/30 to-white blur-3xl" />

      {/* Floating glow elements */}
      <motion.div
        className="absolute top-10 left-1/4 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-1/4 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* TITLE */}
      <motion.h1
        className="text-4xl md:text-5xl font-semibold text-center mb-12 relative z-10 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Let’s Talk
      </motion.h1>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 relative z-10">
        {/* INFO */}
        <motion.div
          className="space-y-6 text-gray-800"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-semibold">Contact Information</h2>

          <p className="text-black/60 leading-relaxed">
            Questions, custom orders, or just curious? We’re here to help—
            discreetly and professionally.
          </p>

          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Email:</span>{" "}
              shantymacpleasures@yahoo.com
            </p>
            <p>
              <span className="font-medium">Phone:</span> +1 876 312 1862
            </p>
            <p>
              <span className="font-medium">Location:</span> Montego Bay,
              Jamaica
            </p>
          </div>
        </motion.div>

        {/* FORM */}
        <motion.div
          className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl p-8 border border-black/10"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-pink-500 font-semibold text-lg"
              >
                ✨ Message sent successfully
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div>
                  <label className="block mb-2 text-sm">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg px-4 py-2 bg-white border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg px-4 py-2 bg-white border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full rounded-lg px-4 py-2 bg-white border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
                  />
                </div>

                {/* 💎 PREMIUM BUTTON */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.03 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg shadow-md hover:shadow-pink-200/40 transition-all duration-300"
                >
                  Send Message
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
