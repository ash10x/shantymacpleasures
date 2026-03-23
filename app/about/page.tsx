"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-36 px-6 relative overflow-hidden">
      {/* 🌫 Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/40 via-purple-100/30 to-white blur-3xl" />

      {/* Floating accents */}
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

      {/* ================= HERO ================= */}
      <motion.div
        className="max-w-4xl mx-auto text-center mb-20 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
          Redefining
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {" "}
            Intimacy & Luxury
          </span>
        </h1>

        <p className="mt-6 text-black/60 text-lg leading-relaxed">
          We believe pleasure should feel elegant, empowering, and completely
          yours. Every product we offer is crafted to elevate confidence,
          connection, and experience.
        </p>
      </motion.div>

      {/* ================= STORY ================= */}
      <motion.div
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center mb-24 relative z-10"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold">Our Story</h2>

          <p className="text-black/60 leading-relaxed">
            Born from a desire to merge design with intimacy, our brand focuses
            on providing products that feel as luxurious as they are functional.
          </p>

          <p className="text-black/60 leading-relaxed">
            We remove the stigma and replace it with sophistication—offering
            experiences that are discreet & premium.
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="overflow-hidden rounded-2xl shadow-xl"
        >
          <Image
            src="/images/about.jpeg"
            alt="Luxury experience"
            width={600}
            height={400}
            className="object-cover w-full h-full"
          />
        </motion.div>
      </motion.div>

      {/* ================= VALUES ================= */}
      <motion.div
        className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {[
          {
            title: "Premium Quality",
            desc: "Every product is crafted with body-safe materials and refined design.",
          },
          {
            title: "Discreet Experience",
            desc: "From packaging to delivery, your privacy is always respected.",
          },
          {
            title: "Modern Innovation",
            desc: "We blend technology and design to elevate every moment.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="backdrop-blur-xl bg-white/70 border border-black/10 rounded-2xl p-6 shadow-md text-center"
          >
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-black/60 text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ================= CTA ================= */}
      <motion.div
        className="text-center mt-24 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl md:text-3xl font-semibold">
          Explore the Experience
        </h2>

        <motion.a
          href="/shop"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block mt-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full shadow-md hover:shadow-pink-200/40 transition"
        >
          Shop Now
        </motion.a>
      </motion.div>
    </div>
  );
}
