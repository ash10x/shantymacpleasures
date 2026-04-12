import { getSession } from "@/server/lib/auth";
import db from "@/server/index";
import { products, messages, users, logs, orders } from "@/server/schema";
import { desc, lte } from "drizzle-orm";
import { Package, Mail, ShoppingCart, Users, Activity, AlertTriangle } from "lucide-react";
import RecentActivityList from "./RecentActivityList";
import Link from "next/link";

const LOW_STOCK_THRESHOLD = 5;

export default async function DashboardPage() {
  const session = await getSession();

  const [productRows, messageRows, userRows, orderRows, recentLogs, lowStockRows] = await Promise.all([
    db.select().from(products),
    db.select().from(messages),
    db.select().from(users),
    db.select().from(orders),
    db.select().from(logs).orderBy(desc(logs.createdAt)).limit(10),
    db.select().from(products).where(lte(products.quantity, LOW_STOCK_THRESHOLD)),
  ]);

  const pendingOrders = orderRows.filter((o) => o.status === "pending").length;
  const outOfStock = lowStockRows.filter((p) => p.quantity === 0);
  const lowStock = lowStockRows.filter((p) => p.quantity > 0);

  const stats = [
    { label: "Products", value: productRows.length, icon: Package, color: "from-pink-500 to-rose-500", href: "/admin/dashboard/products" },
    { label: "Messages", value: messageRows.length, icon: Mail, color: "from-purple-500 to-indigo-500", href: "/admin/dashboard/messages" },
    { label: "Orders", value: orderRows.length, badge: pendingOrders > 0 ? `${pendingOrders} pending` : null, icon: ShoppingCart, color: "from-orange-400 to-amber-500", href: "/admin/dashboard/orders" },
    { label: "Admin Users", value: userRows.length, icon: Users, color: "from-teal-400 to-cyan-500", href: "/admin/dashboard/users" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Overview</h1>
          <p className="admin-page-copy">Welcome back, {session?.username}.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, href, badge }) => (
          <Link key={label} href={href} className="admin-panel p-5 sm:p-6 transition hover:shadow-md">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br ${color}`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm text-slate-500">{label}</p>
              {badge && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">{badge}</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* Inventory Alerts */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="admin-panel admin-panel-body">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-800">Inventory Alerts</h2>
          </div>
          <div className="space-y-2">
            {outOfStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5">
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">OUT OF STOCK</span>
                <span className="text-sm font-medium text-slate-700">{p.name}</span>
                <Link href="/admin/dashboard/products" className="ml-auto text-xs text-pink-600 hover:underline">Edit</Link>
              </div>
            ))}
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-600">LOW: {p.quantity}</span>
                <span className="text-sm font-medium text-slate-700">{p.name}</span>
                <Link href="/admin/dashboard/products" className="ml-auto text-xs text-pink-600 hover:underline">Edit</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="admin-panel overflow-hidden">
        <div className="admin-panel-header">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
          </div>
        </div>
        {recentLogs.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-400">No activity yet.</p>
        ) : (
          <RecentActivityList logs={recentLogs} />
        )}
      </div>
    </div>
  );
}

