"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/server/actions/adminUsers";
import { KeyRound, Loader2, Check } from "lucide-react";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to update password.";
}

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (form.next !== form.confirm) { setError("New passwords do not match."); return; }
    if (form.next.length < 8) { setError("Password must be at least 8 characters."); return; }

    startTransition(async () => {
      try {
        await changePassword(form.current, form.next);
        setForm({ current: "", next: "", confirm: "" });
        setSuccess("Password changed successfully.");
        setTimeout(() => setSuccess(""), 4000);
      } catch (e: unknown) {
        setError(getErrorMessage(e));
      }
    });
  };

  return (
    <div className="admin-page max-w-3xl">
      <div>
        <h1 className="admin-page-title">Settings</h1>
        <p className="admin-page-copy">Manage your account security.</p>
      </div>

      <div className="admin-panel admin-panel-body">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-pink-500 to-purple-600">
            <KeyRound size={15} className="text-white" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Change Password</h2>
        </div>

        {error && <div className="admin-banner-error mb-4">{error}</div>}
        {success && <div className="admin-banner-success mb-4 flex items-center gap-2"><Check size={15} />{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "current", label: "Current password" },
            { key: "next", label: "New password" },
            { key: "confirm", label: "Confirm new password" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="admin-kicker mb-1.5 block">{label}</label>
              <input
                type="password"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
                className="admin-field"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isPending || !form.current || !form.next || !form.confirm}
            className="admin-button-primary mt-2 w-full disabled:opacity-60"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
