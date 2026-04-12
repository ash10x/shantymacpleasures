"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser, deleteUser } from "@/server/actions/adminUsers";
import { Plus, Trash2, X, Check, Loader2, ShieldCheck, Shield } from "lucide-react";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: Date | null;
};

const emptyForm = { username: "", email: "", password: "", role: "admin" as "admin" | "super_admin" };

export default function UsersClient({ users, currentUserId }: { users: User[]; currentUserId: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const refresh = () => router.refresh();

  const handleCreate = () => {
    setError(""); setSuccess("");
    startTransition(async () => {
      try {
        await createUser(form);
        setForm(emptyForm);
        setAdding(false);
        setSuccess("User created successfully.");
        refresh();
        setTimeout(() => setSuccess(""), 3000);
      } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    });
  };

  const handleDelete = (id: number) => {
    setError("");
    startTransition(async () => {
      try {
        await deleteUser(id);
        setDeleteId(null);
        refresh();
      } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); setDeleteId(null); }
    });
  };

  return (
    <div className="admin-page max-w-5xl">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-copy">Super admin only — manage dashboard access</p>
        </div>
        <button
          onClick={() => { setAdding(true); setError(""); }}
          className="admin-button-primary"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {error && <div className="admin-banner-error">{error}</div>}
      {success && <div className="admin-banner-success">{success}</div>}

      {/* Add form */}
      {adding && (
        <div className="admin-panel admin-panel-body">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">New Admin User</h2>
            <button onClick={() => setAdding(false)} className="admin-button-ghost p-2"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["username", "email", "password"] as const).map((key) => (
              <div key={key}>
                <label className="admin-kicker mb-1 block">{key}</label>
                <input
                  type={key === "password" ? "password" : key === "email" ? "email" : "text"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="admin-field"
                />
              </div>
            ))}
            <div>
              <label className="admin-kicker mb-1 block">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "super_admin" })}
                className="admin-select"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => setAdding(false)} className="admin-button-secondary">Cancel</button>
            <button
              onClick={handleCreate}
              disabled={isPending || !form.username || !form.email || !form.password}
              className="admin-button-primary disabled:opacity-60"
            >
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Create User
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="admin-panel overflow-hidden">
        <div className="admin-table-wrap">
        <table className="admin-table text-sm">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Joined</th>
              <th className="w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <p className="font-medium text-slate-800">{u.username}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{u.email}</p>
                </td>
                <td>
                  <span className={`admin-badge ${
                    u.role === "super_admin"
                      ? "admin-badge-purple"
                      : "admin-badge-neutral"
                  }`}>
                    {u.role === "super_admin" ? <ShieldCheck size={12} /> : <Shield size={12} />}
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td className="text-xs text-slate-500">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                </td>
                <td>
                  {u.id === currentUserId ? (
                    <span className="text-xs italic text-slate-300">You</span>
                  ) : deleteId === u.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(u.id)} disabled={isPending} className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50">
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button onClick={() => setDeleteId(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteId(u.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {users.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">No users yet.</p>
        )}
      </div>
    </div>
  );
}
