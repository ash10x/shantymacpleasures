"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 🔐 Replace with real auth later
    setTimeout(() => {
      if (email === "admin@test.com" && password === "123456") {
        alert("Login success");
      } else {
        setError("Invalid credentials");
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-6">
      {/* BACKGROUND GLOW */}
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] bg-pink-500/20 blur-[120px] rounded-full top-[-100px] left-[-100px]"
      />
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]"
      />

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-8"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-2">Secure dashboard login</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 outline-none transition"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 outline-none transition"
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-2.5 text-gray-400"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* ERROR */}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {/* BUTTON */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium bg-linear-to-r from-pink-500 to-purple-600 shadow-lg hover:shadow-pink-400/50 transition"
          >
            {loading ? "Signing in..." : "Login"}
          </motion.button>
        </form>

        {/* FOOTER */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Restricted access • Authorized personnel only
        </p>
      </motion.div>
    </main>
  );
}
