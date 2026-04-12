"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCoupon, toggleCoupon, deleteCoupon, type CouponInput } from "@/server/actions/adminCoupons";
import { Plus, Trash2, X, Check, Loader2, Tag } from "lucide-react";

type Coupon = {
  id: number;
  code: string;
  type: string;
  amount: number;
  minOrder: number;
  maxUses: number | null;
  uses: number;
  active: boolean;
  expiresAt: Date | null;
  createdAt: Date | null;
};

const empty: CouponInput = {
  code: "", type: "percent", amount: 10, minOrder: 0, maxUses: null, expiresAt: null,
};

function getErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong.";
}

export default function CouponsClient({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<CouponInput>(empty);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await createCoupon(form);
        setAdding(false);
        setForm(empty);
        router.refresh();
      } catch (e) {
        setError(getErrorMessage(e));
      }
    });
  };

  const handleToggle = (id: number, active: boolean) => {
    setError("");
    startTransition(async () => {
      try {
        await toggleCoupon(id, active);
        router.refresh();
      } catch (e) {
        setError(getErrorMessage(e));
      }
    });
  };

  const handleDelete = (id: number) => {
    if (deleteId !== id) { setDeleteId(id); return; }
    setError("");
    startTransition(async () => {
      try {
        await deleteCoupon(id);
        setDeleteId(null);
        router.refresh();
      } catch (e) {
        setError(getErrorMessage(e));
      }
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-copy">{coupons.length} discount codes</p>
        </div>
        <button onClick={() => setAdding(true)} className="admin-button-primary">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {error && <div className="admin-banner-error">{error}</div>}

      {adding && (
        <div className="admin-panel admin-panel-body">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">New Coupon</h2>
            <button onClick={() => { setAdding(false); setForm(empty); }} className="admin-button-ghost p-2"><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-kicker mb-1 block">Code</label>
              <input className="admin-field uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="SUMMER20" />
            </div>
            <div>
              <label className="admin-kicker mb-1 block">Type</label>
              <select className="admin-select w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "flat" })}>
                <option value="percent">Percent off (%)</option>
                <option value="flat">Flat amount ($)</option>
              </select>
            </div>
            <div>
              <label className="admin-kicker mb-1 block">
                {form.type === "percent" ? "Discount %" : "Discount amount (cents)"}
              </label>
              <input type="number" className="admin-field" value={form.amount} min={1} max={form.type === "percent" ? 100 : undefined} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
            </div>
            <div>
              <label className="admin-kicker mb-1 block">Min order (cents, 0 = no min)</label>
              <input type="number" className="admin-field" value={form.minOrder} min={0} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
            </div>
            <div>
              <label className="admin-kicker mb-1 block">Max uses (blank = unlimited)</label>
              <input type="number" className="admin-field" value={form.maxUses ?? ""} min={1} onChange={(e) => setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : null })} placeholder="Unlimited" />
            </div>
            <div>
              <label className="admin-kicker mb-1 block">Expires (optional)</label>
              <input type="datetime-local" className="admin-field" value={form.expiresAt ?? ""} onChange={(e) => setForm({ ...form, expiresAt: e.target.value || null })} />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={isPending} className="admin-button-primary disabled:opacity-60">
                {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Create
              </button>
              <button type="button" onClick={() => { setAdding(false); setForm(empty); }} className="admin-button-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-panel overflow-hidden">
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <Tag size={32} strokeWidth={1.5} />
            <p className="text-sm">No coupons yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min order</th>
                  <th>Uses</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td><span className="font-mono font-semibold text-slate-800">{c.code}</span></td>
                    <td>
                      {c.type === "percent"
                        ? `${c.amount}%`
                        : `$${(c.amount / 100).toFixed(2)}`}
                    </td>
                    <td>{c.minOrder > 0 ? `$${(c.minOrder / 100).toFixed(2)}` : "—"}</td>
                    <td>{c.uses}{c.maxUses !== null ? ` / ${c.maxUses}` : ""}</td>
                    <td className="text-xs text-slate-500">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(c.id, !c.active)}
                        disabled={isPending}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${c.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={isPending}
                        className={`admin-button-ghost p-1.5 ${deleteId === c.id ? "text-red-500!" : ""}`}
                        title={deleteId === c.id ? "Click again to confirm" : "Delete"}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
