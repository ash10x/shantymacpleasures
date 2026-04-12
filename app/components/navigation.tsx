"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import MiniCart from "./miniCart";
import { useCart } from "@/app/context/cartContext";
import { searchProducts } from "@/server/actions/getProducts";

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

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: number; name: string; price: number; image: string; category: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

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
  useEffect(() => {
    const handler = (e: any) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const handleResultClick = (id: number) => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/shop/${id}`);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "py-2 bg-white/80 backdrop-blur-xl shadow-lg"
            : "py-4 bg-white/60 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* LOGO */}
          <Image
            src="/logo/logo.png"
            alt="Velvet"
            width={90}
            height={90}
            className="object-contain"
          />

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link key={link.name} href={link.href}>
                  <div className="relative group cursor-pointer text-sm font-semibold tracking-wide">
                    <span className="text-gray-700 group-hover:text-black transition">
                      {link.name}
                    </span>

                    {active && (
                      <motion.div
                        layoutId="pill"
                        className="absolute -bottom-2 left-0 right-0 h-[3px] bg-pink-500 rounded-full"
                      />
                    )}

                    <span className="absolute left-0 -bottom-2 h-[3px] w-0 bg-pink-400 group-hover:w-full transition-all duration-300" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-5">
            <Search
              onClick={() => setSearchOpen(true)}
              className="cursor-pointer hover:scale-110 transition"
            />

            {/* CART ICON */}
            <div
              onClick={() => setCartOpen(true)}
              className="relative cursor-pointer hover:scale-110 transition"
            >
              <ShoppingCart />

              {/* COUNT BADGE */}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </div>

            <Menu onClick={() => setMenuOpen(true)} className="md:hidden" />
          </div>
        </div>
      </nav>

      {/* ================= SEARCH ================= */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 backdrop-blur-2xl flex justify-center pt-32 px-4 z-50"
          >
            {/* CLOSE BUTTON */}
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
                    className="w-full flex items-center justify-between p-3 hover:bg-pink-50 rounded-xl cursor-pointer transition text-left group"
                  >
                    <div>
                      <p className="font-medium text-gray-800 group-hover:text-pink-600 transition">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                    </div>
                    <span className="text-pink-600 font-semibold">${item.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ REAL CART */}
      <MiniCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ================= MOBILE ================= */}
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
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
