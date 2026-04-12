"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addMessage } from "@/server/actions/addMessage";

type SubmitState = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState<SubmitState>("idle");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted("loading");

    try {
      const result = await addMessage(form);

      if (result.success) {
        setSubmitted("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setSubmitted("error");
        console.error(result.error);
      }
    } catch (err) {
      setSubmitted("error");
      console.error(err);
    }

    setTimeout(() => setSubmitted("idle"), 4000);
  };

  return (
    <div className="relative min-h-screen py-36 px-6 overflow-hidden bg-white">
      {/* ================= AMBIENT BACKGROUND ================= */}
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute w-120 h-120 bg-pink-500/20 blur-[120px] rounded-full top-10 -left-40"
      />
      <motion.div
        animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute w-120 h-120 bg-purple-500/20 blur-[120px] rounded-full bottom-0 -right-40"
      />

      <div className="absolute inset-0 bg-linear-to-br from-white via-pink-50/40 to-white" />

      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-semibold bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Let’s Talk
        </h1>
        <p className="text-black/60 mt-3 max-w-xl mx-auto">
          Questions, custom orders, or need guidance? Reach out anytime — we
          respond fast and discreetly.
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 relative z-10">
        {/* ================= INFO ================= */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-gray-800">
            Contact Information
          </h2>

          <p className="text-black/60 leading-relaxed">
            We value your privacy and discretion. Every message is handled with
            care and professionalism.
          </p>

          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-medium">Email:</span>{" "}
              <a
                href="mailto:shantymacpleasures@yahoo.com"
                className="underline hover:text-pink-600 transition"
              >
                shantymacpleasures@yahoo.com
              </a>
            </p>
            <p>
              <span className="font-medium">Phone:</span> +1 876 312 1862
            </p>
            <p>
              <span className="font-medium">Location:</span> Montego Bay,
              Jamaica
            </p>
          </div>

          {/* TRUST */}
          <div className="pt-6 text-sm text-black/50">
            🔒 100% discreet • ⚡ Fast response • 💬 Friendly support
          </div>
        </motion.div>

        {/* ================= FORM ================= */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl p-8 border border-black/10"
        >
          <AnimatePresence mode="wait">
            {/* SUCCESS */}
            {submitted === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p className="text-green-500 text-lg font-semibold">
                  ✓ Message sent successfully
                </p>
                <p className="text-sm text-black/60 mt-2">
                  We’ll get back to you shortly.
                </p>
              </motion.div>
            )}

            {/* ERROR */}
            {submitted === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-red-500"
              >
                ⚠️ Failed to send message. Please try again.
              </motion.div>
            )}

            {/* LOADING */}
            {submitted === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center py-10"
              >
                <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}

            {/* FORM */}
            {submitted === "idle" && (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <label className="block mb-2 text-sm">Name</label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg px-4 py-2 bg-white/80 border border-black/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition"
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
                    className="w-full rounded-lg px-4 py-2 bg-white/80 border border-black/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition"
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
                    className="w-full rounded-lg px-4 py-2 bg-white/80 border border-black/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition"
                  />
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  type="submit"
                  className="w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg shadow-lg hover:shadow-pink-300/40 transition-all"
                >
                  Send Message
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ================= BOTTOM FADE ================= */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-b from-transparent to-white pointer-events-none" />
    </div>
  );
}
