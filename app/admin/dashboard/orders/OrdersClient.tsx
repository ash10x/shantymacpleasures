"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/server/actions/adminOrders";
import { ShoppingCart, ChevronDown } from "lucide-react";

type Order = {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerAddress: string | null;
  customerCity: string | null;
  couponCode: string | null;
  discountAmount: number;
  status: string;
  createdAt: Date | null;
};

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-slate-100 text-slate-500",
};

function getErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong.";
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const handleStatus = (id: number, status: string) => {
    setError("");
    startTransition(async () => {
      try {
        await updateOrderStatus(id, status);
        router.refresh();
      } catch (e) {
        setError(getErrorMessage(e));
      }
    });
  };

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-copy">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="admin-select"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="admin-banner-error">{error}</div>}

      <div className="admin-panel overflow-hidden">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <ShoppingCart size={32} strokeWidth={1.5} />
            <p className="text-sm">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Product ID</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Coupon</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs text-slate-400">#{order.id}</td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <p className="font-medium text-slate-800">{order.customerName}</p>
                      <p className="text-xs text-slate-400">{order.customerEmail}</p>
                      {order.customerCity && (
                        <p className="text-xs text-slate-400">{order.customerCity}</p>
                      )}
                    </td>
                    <td className="font-mono text-xs">{order.productId}</td>
                    <td>{order.quantity}</td>
                    <td className="font-semibold text-slate-800">
                      ${(order.totalPrice / 100).toFixed(2)}
                      {order.discountAmount > 0 && (
                        <span className="ml-1 text-xs text-green-600">
                          −${(order.discountAmount / 100).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td>
                      {order.couponCode
                        ? <span className="admin-badge admin-badge-purple">{order.couponCode}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td>
                      <div className="relative inline-flex items-center gap-1">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {order.status}
                        </span>
                        <div className="relative">
                          <select
                            disabled={isPending}
                            value={order.status}
                            onChange={(e) => handleStatus(order.id, e.target.value)}
                            className="absolute inset-0 w-full cursor-pointer opacity-0"
                            aria-label="Change status"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown size={13} className="text-slate-400" />
                        </div>
                      </div>
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
