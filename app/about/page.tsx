"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white py-36 px-6 overflow-hidden">
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

      {/* ================= HERO ================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center mb-24 relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-semibold leading-[1.1]">
          Redefining
          <span className="bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
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
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center mb-28 relative z-10"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        {/* TEXT */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Our Story</h2>

          <p className="text-black/60 leading-relaxed">
            Born from a desire to merge design with intimacy, our brand focuses
            on providing products that feel as luxurious as they are functional.
          </p>

          <p className="text-black/60 leading-relaxed">
            We remove the stigma and replace it with sophistication—offering
            experiences that are discreet, refined, and deeply personal.
          </p>
        </div>

        {/* IMAGE */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          className="relative overflow-hidden rounded-3xl shadow-2xl"
        >
          <Image
            src="/images/about.jpeg"
            alt="Luxury experience"
            width={600}
            height={400}
            className="object-cover w-full h-full transition duration-700 hover:scale-110"
          />

          {/* subtle overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
        </motion.div>
      </motion.div>

      {/* ================= VALUES ================= */}
      <motion.div
        className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 relative z-10"
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
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="group backdrop-blur-xl bg-white/70 border border-black/10 rounded-2xl p-7 shadow-md hover:shadow-xl hover:shadow-pink-100/40 transition text-center"
          >
            <h3 className="text-lg font-semibold mb-2 group-hover:text-pink-600 transition">
              {item.title}
            </h3>
            <p className="text-black/60 text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ================= CTA ================= */}
      <motion.div
        className="text-center mt-28 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl md:text-3xl font-semibold">
          Explore the Experience
        </h2>

        <motion.a
          href="/shop"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-block mt-6 bg-linear-to-r from-pink-500 to-purple-600 text-white px-10 py-3 rounded-full shadow-xl hover:shadow-pink-300/40 transition-all"
        >
          Shop Now
        </motion.a>
      </motion.div>

      {/* ================= BOTTOM FADE ================= */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-b from-transparent to-white pointer-events-none" />
    </div>
  );
}
