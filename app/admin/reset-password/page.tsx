"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset token is missing. Please request a new link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Could not reset password");

      setSuccess("Password updated. Redirecting to login...");
      setTimeout(() => router.push("/admin"), 1200);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not reset password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="admin-panel w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Set New Password</h1>
        <p className="mt-2 text-sm text-slate-500">Use a strong password with at least 8 characters.</p>

        {error && <p className="admin-banner-error mt-4">{error}</p>}
        {success && <p className="admin-banner-success mt-4">{success}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="admin-kicker mb-1 block">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-field w-full"
              required
            />
          </div>
          <div>
            <label className="admin-kicker mb-1 block">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="admin-field w-full"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="admin-button-primary w-full disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500">
          <Link href="/admin" className="text-pink-600 hover:underline">Return to admin login</Link>
        </div>
      </div>
    </main>
  );
}
