"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, Menu, X, ShieldCheck } from "lucide-react";
import MiniCart from "./miniCart";
import { useCart } from "@/app/context/cartContext";
import { searchProducts } from "@/server/actions/getProducts";
import { useCurrency } from "@/app/context/currencyContext";
import { formatMoney, FX_RATE_AS_OF, USD_TO_JMD_RATE } from "@/server/lib/money";

function AdminQuickLink() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => {
      if (r.ok) setIsAdmin(true);
    });
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin/dashboard"
      className="flex items-center gap-1.5 rounded-full border border-[#e8c4df] bg-[#faeaf3] px-3 py-1 text-xs font-semibold text-[#76227e] transition hover:bg-[#f4dfef]"
    >
      <ShieldCheck size={13} />
      Admin
    </Link>
  );
}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const { currency, setCurrency } = useCurrency();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: number; name: string; price: number; image: string; category: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  /* ================= ADMIN HIDE ================= */
  const isAdminRoute = pathname.startsWith("/admin");

  /* ================= SCROLL ================= */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= GLOBAL CLOSE ================= */
  useEffect(() => {
    document.body.style.overflow =
      menuOpen || searchOpen || cartOpen ? "hidden" : "auto";

    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setCartOpen(false);
      }
    };

    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [menuOpen, searchOpen, cartOpen]);

  useEffect(() => {
    const openCart = () => setCartOpen(true);
    window.addEventListener("open-cart", openCart);
    return () => window.removeEventListener("open-cart", openCart);
  }, []);

  /* ================= CLICK OUTSIDE ================= */
  // Intentionally not clearing results on outside click — the search overlay
  // is a full-screen modal; clicking outside the input box should not wipe results.

  /* ================= SEARCH ================= */
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) return setResults([]);
      setSearching(true);
      try {
        const data = await searchProducts(query.trim());
        setResults(data);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(delay);
  }, [query]);

  // Re-run search when overlay reopens with an existing query
  useEffect(() => {
    if (searchOpen && query.trim()) {
      setSearching(true);
      searchProducts(query.trim())
        .then(setResults)
        .finally(() => setSearching(false));
    }
  }, [searchOpen, query]);

  const handleResultClick = (id: number) => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/shop/${id}`);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const currencySwitcher = (
    <div className="flex flex-col items-center leading-tight">
    <div className="inline-flex shrink-0 rounded-full border border-[#d7bbd7] bg-white/80 p-0.5 text-xs" role="group" aria-label="Display currency">
      {(["USD", "JMD"] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={currency === code}
          onClick={() => setCurrency(code)}
          title={code === "JMD" ? `Approximate conversion at ${USD_TO_JMD_RATE} JMD per USD (rate date ${FX_RATE_AS_OF})` : "Display prices in US dollars"}
          className={`rounded-full px-2.5 py-1 font-semibold transition ${currency === code ? "bg-[#2b1238] text-white" : "text-slate-600 hover:text-[#662071]"}`}
        >
          {code}
        </button>
      ))}
    </div>
    {currency === "JMD" && <span className="mt-1 whitespace-nowrap text-[9px] text-slate-500">Approx. {USD_TO_JMD_RATE} JMD/USD · {FX_RATE_AS_OF}</span>}
    </div>
  );

  if (isAdminRoute) return null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "py-2 bg-[#faf8f5]/95 backdrop-blur-xl shadow-sm"
            : "py-3 bg-[#faf8f5]/85 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" aria-label="ShantyMac Pleasures home" className="shrink-0"><Image src="/logo/logo.png" alt="ShantyMac Pleasures" width={72} height={72} className="object-contain" /></Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link key={link.name} href={link.href}>
                  <div className="relative group cursor-pointer text-sm font-semibold tracking-wide">
                      <span className="text-[#51463e] group-hover:text-[#2b1238] transition">
                      {link.name}
                    </span>

                    {active && (
                      <motion.div
                        layoutId="pill"
                        className="absolute -bottom-2 left-0 right-0 h-0.75 bg-[#76227e] rounded-full"
                      />
                    )}

                    <span className="absolute left-0 -bottom-2 h-0.75 w-0 bg-[#76227e] group-hover:w-full transition-all duration-300" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-5">
            {currencySwitcher}
            <AdminQuickLink />
            <button type="button" onClick={() => setSearchOpen(true)} className="rounded-full p-2 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#662071]" aria-label="Search products"><Search size={19} /></button>

            {/* CART ICON */}
            <button type="button" onClick={() => setCartOpen(true)} className="relative rounded-full p-2 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#662071]" aria-label={`Open shopping bag${cartCount ? `, ${cartCount} items` : ""}`}>
              <ShoppingCart size={19} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-[#662071] px-1.5 py-0.5 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button type="button" onClick={() => setMenuOpen(true)} className="rounded-full p-2 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#662071] md:hidden" aria-label="Open navigation menu"><Menu size={20} /></button>
          </div>
        </div>
      </nav>

      {/* SEARCH */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 backdrop-blur-2xl flex justify-center pt-32 px-4 z-50"
          >
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-black/10 hover:bg-black/20 transition"
            >
              <X size={22} />
            </button>

            <div ref={searchRef} className="w-full max-w-2xl">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full text-2xl border-b border-gray-300 bg-transparent outline-none pb-3"
              />

              <div className="mt-6 space-y-3">
                {!query && (
                  <p className="text-gray-400">Start typing to search...</p>
                )}

                {query && searching && (
                  <p className="text-gray-400">Searching...</p>
                )}

                {query && !searching && results.length === 0 && (
                  <p className="text-gray-500">No products found</p>
                )}

                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleResultClick(item.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#faeaf3] rounded-xl cursor-pointer transition text-left group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#faeaf3] shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 group-hover:text-[#76227e] transition truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                    </div>
                    <span className="text-[#76227e] font-semibold shrink-0">{formatMoney(item.price, currency)}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART */}
      <MiniCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* MOBILE */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 h-full w-2/3 bg-white p-6 z-50"
          >
            <X onClick={() => setMenuOpen(false)} />

            <div className="mt-10 flex flex-col gap-6 text-lg font-medium">
              <div className="flex items-center gap-3 text-sm">
                <span>Display currency</span>
                {currencySwitcher}
              </div>
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  {link.name}
                </Link>
              ))}
              <AdminQuickLink />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
