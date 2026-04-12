"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  Activity,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  ShieldCheck,
  Mail,
  ExternalLink,
  ShoppingCart,
  Tag,
} from "lucide-react";
import type { SessionPayload } from "@/server/lib/auth";

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/dashboard/products", label: "Products", icon: Package },
  { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/dashboard/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/dashboard/messages", label: "Messages", icon: Mail },
  { href: "/admin/dashboard/users", label: "Users", icon: Users, superAdminOnly: true },
  { href: "/admin/dashboard/activity", label: "Activity", icon: Activity },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];

type DashboardSidebarProps = {
  unreadCount: number;
  pathname: string;
  session: SessionPayload;
  onLogout: () => void;
  onNavigate: () => void;
};

function DashboardSidebar({
  unreadCount,
  pathname,
  session,
  onLogout,
  onNavigate,
}: Readonly<DashboardSidebarProps>) {
  const visibleNav = navItems.filter(
    (item) => !item.superAdminOnly || session.role === "super_admin",
  );

  return (
    <aside className="flex h-full w-72 flex-col border-r border-white/10 bg-slate-950 text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/20">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight tracking-tight">Shanty Mac</p>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleNav.map(({ href, label, icon: Icon }) => {
          const isIndex = href === "/admin/dashboard";
          const active = isIndex
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                active
                  ? "border border-white/10 bg-white/10 text-white shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              {label}
              {href === "/admin/dashboard/messages" && unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-pink-500 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                  {unreadCount}
                </span>
              )}
              {active && href !== "/admin/dashboard/messages" && <ChevronRight size={14} className="ml-auto opacity-60" />}
              {active && href === "/admin/dashboard/messages" && unreadCount === 0 && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="mb-2 rounded-xl bg-white/5 px-3 py-3">
          <p className="text-xs font-semibold text-white truncate">{session.username}</p>
          <p className="text-xs capitalize text-slate-400">{session.role.replace("_", " ")}</p>
        </div>
        <Link
          href="/"
          className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-all hover:bg-white/5 hover:text-white"
        >
          <ExternalLink size={17} />
          View Site
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function DashboardShell({
  children,
  session,
  unreadCount = 0,
}: {
  children: React.ReactNode;
  session: SessionPayload;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <div className="admin-shell flex min-h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden shrink-0 md:flex">
        <DashboardSidebar
          unreadCount={unreadCount}
          pathname={pathname}
          session={session}
          onLogout={handleLogout}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 flex h-full w-72 max-w-[85vw]">
            <DashboardSidebar
              unreadCount={unreadCount}
              pathname={pathname}
              session={session}
              onLogout={handleLogout}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex shrink-0 items-center gap-4 border-b border-slate-200/70 bg-white/75 px-4 py-4 backdrop-blur md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-800 md:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Dashboard</p>
            <p className="truncate text-sm text-slate-600 sm:text-base">
              Welcome back, <strong className="font-semibold text-slate-900">{session.username}</strong>
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="admin-main flex-1">{children}</main>
      </div>
    </div>
  );
}
