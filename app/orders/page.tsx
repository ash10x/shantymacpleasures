"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";

type OrderRow = {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  couponCode: string | null;
  discountAmount: number;
  status: string;
  createdAt: string | null;
};

function getErrMsg(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong.";
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-slate-100 text-slate-500",
};

function OrdersContent() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setOrders(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/orders?email=${encodeURIComponent(email.trim())}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load orders");
        setOrders(data.orders);
      } catch (e) {
        setError(getErrMsg(e));
      }
    });
  };

  return (
    <div className="min-h-screen bg-white py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-pink-100/40 via-purple-100/30 to-white blur-3xl" />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold mb-2 text-center">Order History</h1>
          <p className="text-black/60 text-center mb-10">Enter your email to view your orders.</p>
        </motion.div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-3 rounded-xl border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-3 rounded-xl bg-linear-to-r from-pink-500 to-purple-600 text-white font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search
          </button>
        </form>

        {error && (
          <p className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {orders !== null && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {orders.length === 0 ? (
              <p className="text-center text-black/60 py-10">No orders found for this email address.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-mono text-xs text-black/40">Order #{order.id}</p>
                        <p className="text-xs text-black/50">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-black/70">
                      <div className="flex justify-between">
                        <span>Qty {order.quantity}</span>
                        <span className="font-semibold text-black">${(order.totalPrice / 100).toFixed(2)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600 text-xs">
                          <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                          <span>−${(order.discountAmount / 100).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}
