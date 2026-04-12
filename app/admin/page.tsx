"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

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

  const [remember, setRemember] = useState(false); // kept for UI checkbox only
  const [forgotMode, setForgotMode] = useState(false);

  /* ================= AUTO AUTH CHECK ================= */
  useEffect(() => {
    fetch("/api/auth/me").then((r) => {
      if (r.ok) router.replace("/admin/dashboard");
    });
  }, [router]);

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

      setSuccess("Login successful. Redirecting...");
      setTimeout(() => router.push("/admin/dashboard"), 800);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid credentials"));
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to send reset link"));
    } finally {
      setResetLoading(false);
    }
  };

  const isLoginDisabled = !email || !password || loginLoading;
  const isResetDisabled = !resetEmail || resetLoading;

  return (
    <main className="admin-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      {/* BACKGROUND */}
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute w-125 h-125 bg-pink-500/20 blur-[120px] rounded-full -top-25 -left-25"
      />
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute w-125 h-125 bg-purple-500/20 blur-[120px] rounded-full -bottom-25 -right-25"
      />

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-panel relative z-10 w-full max-w-md p-6 sm:p-8"
      >
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {forgotMode ? "Reset Password" : "Admin Access"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {forgotMode
              ? "Enter email to receive reset link"
              : "Secure dashboard login"}
          </p>
        </div>

        {/* STATUS MESSAGES */}
        {error && (
          <p className="admin-banner-error mb-3 text-center">{error}</p>
        )}
        {success && (
          <p className="admin-banner-success mb-3 text-center">{success}</p>
        )}

        {/* ================= LOGIN ================= */}
        {!forgotMode ? (
          <form onSubmit={handleLogin} className="space-y-5">
            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-field w-full pl-10 pr-3"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={show ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-field w-full pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center p-1"
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
                className="font-medium text-pink-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* BUTTON */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={isLoginDisabled}
              className="admin-button-primary w-full py-3 disabled:opacity-50"
            >
              {loginLoading ? "Signing in..." : "Login"}
            </motion.button>
          </form>
        ) : (
          /* ================= RESET ================= */
          <form onSubmit={handleReset} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="admin-field w-full pl-10 pr-3"
                required
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={isResetDisabled}
              className="admin-button-primary w-full py-3 disabled:opacity-50"
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
              className="w-full text-center text-sm text-slate-500 hover:text-slate-900"
            >
              Back to login
            </button>
          </form>
        )}

        {/* FOOTER */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Restricted access • Authorized personnel only
        </p>
      </motion.div>
    </main>
  );
}
