"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  /* ================= AUTH STATE ================= */
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [password, setPassword] = useState("");

  const [show, setShow] = useState(false);

  const [loginLoading, setLoginLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [remember, setRemember] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);

  /* ================= AUTO AUTH CHECK ================= */
  useEffect(() => {
    const token =
      localStorage.getItem("admin_auth") ||
      sessionStorage.getItem("admin_auth");

    if (token) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  /* ================= STORAGE ================= */
  const storeAuth = (token: string) => {
    if (remember) {
      localStorage.setItem("admin_auth", token);
    } else {
      sessionStorage.setItem("admin_auth", token);
    }
  };

  /* ================= LOGIN ================= */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Login failed");

      if (!data?.token) throw new Error("No token returned");

      storeAuth(data.token);

      setSuccess("Login successful. Redirecting...");

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 800);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoginLoading(false);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Reset failed");

      setSuccess("Reset link sent successfully");
      setResetEmail("");

      setTimeout(() => {
        setForgotMode(false);
        setSuccess("");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Unable to send reset link");
    } finally {
      setResetLoading(false);
    }
  };

  const isLoginDisabled = !email || !password || loginLoading;
  const isResetDisabled = !resetEmail || resetLoading;

  return (
    <main className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-6">
      {/* BACKGROUND */}
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

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-8"
      >
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">
            {forgotMode ? "Reset Password" : "Admin Access"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {forgotMode
              ? "Enter email to receive reset link"
              : "Secure dashboard login"}
          </p>
        </div>

        {/* STATUS MESSAGES */}
        {error && (
          <p className="text-sm text-red-500 text-center mb-3">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-500 text-center mb-3">{success}</p>
        )}

        {/* ================= LOGIN ================= */}
        {!forgotMode ? (
          <form onSubmit={handleLogin} className="space-y-5">
            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 outline-none"
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
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 outline-none"
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

            {/* OPTIONS */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotMode(true);
                  setError("");
                  setSuccess("");
                }}
                className="text-pink-500 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* BUTTON */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={isLoginDisabled}
              className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-600 disabled:opacity-50"
            >
              {loginLoading ? "Signing in..." : "Login"}
            </motion.button>
          </form>
        ) : (
          /* ================= RESET ================= */
          <form onSubmit={handleReset} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 outline-none"
                required
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={isResetDisabled}
              className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-600 disabled:opacity-50"
            >
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </motion.button>

            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setError("");
                setSuccess("");
              }}
              className="text-sm text-center w-full text-gray-500 hover:text-black"
            >
              Back to login
            </button>
          </form>
        )}

        {/* FOOTER */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Restricted access • Authorized personnel only
        </p>
      </motion.div>
    </main>
  );
}
