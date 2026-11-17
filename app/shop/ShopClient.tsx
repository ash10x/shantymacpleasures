"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownWideNarrow, ArrowRight, Check, Filter, Search, X } from "lucide-react";
import { useCart } from "../context/cartContext";
import { useCurrency } from "@/app/context/currencyContext";
import { formatMoney } from "@/server/lib/money";
import type { products } from "@/server/schema";

type Product = typeof products.$inferSelect;
type SortMode = "featured" | "price-asc" | "price-desc";
type Availability = "all" | "in-stock";
const ITEMS_PER_PAGE = 12;

interface Props {
  products: Product[];
  categories: string[];
}

export default function ShopClient({ products, categories }: Props) {
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  const reduceMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState<Availability>("all");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const closeQuickViewRef = useRef<HTMLButtonElement>(null);
  const closeFiltersRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const min = minPrice.trim() ? Math.max(0, Number(minPrice) * 100) : null;
    const max = maxPrice.trim() ? Math.max(0, Number(maxPrice) * 100) : null;
    const filtered = products.filter((product) => {
      const matchesQuery = !query || `${product.name} ${product.category} ${product.description}`.toLocaleLowerCase().includes(query);
      const matchesCategory = category === "All" || product.category === category;
      const matchesStock = availability === "all" || product.quantity > 0;
      const matchesMin = min === null || !Number.isFinite(min) || product.price >= min;
      const matchesMax = max === null || !Number.isFinite(max) || product.price <= max;
      return matchesQuery && matchesCategory && matchesStock && matchesMin && matchesMax;
    });

    return filtered.sort((a, b) => {
      if (sortMode === "price-asc") return a.price - b.price;
      if (sortMode === "price-desc") return b.price - a.price;
      return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name);
    });
  }, [products, search, category, availability, minPrice, maxPrice, sortMode]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const hasFilters = Boolean(search || category !== "All" || availability !== "all" || minPrice || maxPrice);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setAvailability("all");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  const selectCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    setPage(1);
  };

  const openQuickView = (product: Product) => {
    returnFocusRef.current = document.activeElement as HTMLElement;
    setQuickQuantity(1);
    setQuickView(product);
  };

  useEffect(() => {
    if (!quickView && !filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQuickView(null);
        setFiltersOpen(false);
      }
      if (event.key === "Tab") {
        const dialog = document.querySelector<HTMLElement>("[data-shop-dialog]");
        const focusable = dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled)');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [quickView, filtersOpen]);

  useEffect(() => {
    if (quickView) requestAnimationFrame(() => closeQuickViewRef.current?.focus());
    else requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, [quickView]);

  useEffect(() => {
    if (filtersOpen) requestAnimationFrame(() => closeFiltersRef.current?.focus());
    else if (!quickView) requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, [filtersOpen, quickView]);

  const addProduct = (product: Product, quantity = 1) => {
    if (product.quantity <= 0 || quantity < 1 || quantity > product.quantity) return;
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image }, quantity);
    setAddedProductId(product.id);
    window.dispatchEvent(new Event("open-cart"));
    setTimeout(() => setAddedProductId((current) => current === product.id ? null : current), 1600);
    setQuickView(null);
  };

  const filterFields = (
    <>
      <label className="relative block min-w-48 flex-1">
        <span className="sr-only">Search products</span>
        <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          placeholder="Search the collection"
          className="h-11 w-full border-b border-stone-300 bg-transparent pl-9 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900"
        />
      </label>
      <label className="flex min-w-0 items-center gap-2 text-sm text-stone-700">
        <span className="text-xs uppercase tracking-[0.12em] text-stone-500">Stock</span>
        <select value={availability} onChange={(event) => { setAvailability(event.target.value as Availability); setPage(1); }} className="h-11 min-w-28 border-b border-stone-300 bg-transparent px-1 text-sm outline-none focus:border-stone-900">
          <option value="all">All products</option>
          <option value="in-stock">In stock</option>
        </select>
      </label>
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-xs uppercase tracking-[0.12em] text-stone-500">USD price</span>
        <label className="flex items-center gap-1 border-b border-stone-300 px-1 text-sm focus-within:border-stone-900">
          <span className="sr-only">Minimum price in USD</span><span className="text-[10px] font-medium text-stone-400">USD</span>
          <input inputMode="decimal" type="number" min="0" step="1" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPage(1); }} placeholder="Min" className="w-14 bg-transparent py-3 outline-none placeholder:text-stone-400" />
        </label>
        <span className="text-stone-400">–</span>
        <label className="flex items-center gap-1 border-b border-stone-300 px-1 text-sm focus-within:border-stone-900">
          <span className="sr-only">Maximum price in USD</span><span className="text-[10px] font-medium text-stone-400">USD</span>
          <input inputMode="decimal" type="number" min="0" step="1" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1); }} placeholder="Max" className="w-14 bg-transparent py-3 outline-none placeholder:text-stone-400" />
        </label>
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-[#f8f6f1] pb-24 text-[#25211e]">
      <section className="mx-auto max-w-[1440px] px-4 pt-28 sm:px-8 lg:px-12 lg:pt-32">
        <div className="grid min-h-[390px] overflow-hidden bg-[#eee8df] md:grid-cols-[0.92fr_1.08fr] lg:min-h-[500px]">
          <div className="flex flex-col items-start justify-center px-7 py-12 sm:px-12 lg:px-16 lg:py-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a45168]">The ShantyMac Collection</p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.02] tracking-[-0.035em] text-[#2e2824] sm:text-6xl lg:text-7xl">Discover your pleasure.</h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#625952] sm:text-base">An elevated collection of intimate essentials, thoughtfully curated to celebrate confidence, comfort, and personal wellness.</p>
            <a href="#collection" className="group mt-8 inline-flex items-center gap-3 border-b border-[#a45168] pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#713b4d] transition-colors hover:text-[#a45168] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a45168]">
              Explore the collection <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <div className="relative min-h-[250px] sm:min-h-[330px] md:min-h-full">
            <Image src="/images/shop-editorial.webp" alt="Warm studio still life with burgundy calla lilies, a ceramic vase, and champagne silk" fill priority sizes="(max-width: 768px) 100vw, 55vw" className="object-cover object-[62%_center]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pt-12 sm:px-8 lg:px-12 lg:pt-16" aria-label="Browse product categories">
        <div className="flex items-end justify-between gap-4 border-b border-[#d9d2c8] pb-4">
          <div><p className="text-[10px] uppercase tracking-[0.22em] text-[#a45168]">Find your fit</p><h2 className="mt-2 font-serif text-2xl sm:text-3xl">Browse by category</h2></div>
          <span className="hidden text-xs text-stone-500 sm:block">{categories.length} {categories.length === 1 ? "category" : "categories"}</span>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
          {["All", ...categories].map((name) => {
            const count = name === "All" ? products.length : products.filter((item) => item.category === name).length;
            const active = category === name;
            return <button key={name} type="button" aria-pressed={active} onClick={() => selectCategory(name)} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a45168] ${active ? "border-[#a45168] text-[#713b4d]" : "border-transparent text-stone-600 hover:border-stone-400 hover:text-stone-900"}`}>
              <span>{name}</span><span className="text-[10px] tabular-nums text-stone-400">{count}</span>
            </button>;
          })}
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-[1440px] scroll-mt-24 px-4 pt-10 sm:px-8 lg:px-12 lg:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#d9d2c8] pb-5">
          <div><p className="text-[10px] uppercase tracking-[0.22em] text-[#a45168]">Thoughtfully selected</p><h2 className="mt-2 font-serif text-3xl sm:text-4xl">The collection</h2></div>
          <div className="flex items-center gap-3 text-sm text-stone-600"><span aria-live="polite">{filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}</span><span aria-hidden="true" className="text-stone-300">/</span>
            <label className="flex items-center gap-2"><ArrowDownWideNarrow size={15} aria-hidden="true"/><span className="sr-only">Sort products</span><select value={sortMode} onChange={(event) => { setSortMode(event.target.value as SortMode); setPage(1); }} className="bg-transparent py-2 text-sm text-stone-700 outline-none focus-visible:ring-2 focus-visible:ring-[#a45168]"><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-[#e2ddd5] py-3 md:hidden">
          <button type="button" onClick={(event) => { returnFocusRef.current = event.currentTarget; setFiltersOpen(true); }} className="inline-flex h-10 items-center gap-2 border border-[#d9d2c8] px-3 text-xs font-semibold uppercase tracking-[0.12em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a45168]"><Filter size={15} aria-hidden="true"/> Filters {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-[#a45168]"/>}</button>
          {hasFilters && <button type="button" onClick={clearFilters} className="text-xs text-stone-500 underline underline-offset-4">Clear all</button>}
        </div>
        <div className="hidden items-center gap-6 border-b border-[#e2ddd5] py-2 md:flex">{filterFields}{hasFilters && <button type="button" onClick={clearFilters} className="shrink-0 text-xs text-stone-500 underline underline-offset-4 hover:text-stone-900">Clear all</button>}</div>

        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 pt-6 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
            {currentProducts.map((product) => (
              <article key={product.id} className="group min-w-0">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#eeeae3]">
                  <Link href={`/shop/${product.id}`} aria-label={`View ${product.name}`} className="absolute inset-0 z-[1] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#a45168]">
                    <Image src={product.image} alt={product.imageAlt?.trim() || product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" loading="lazy" className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none" />
                  </Link>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" />
                  {product.featured && <span className="absolute left-2 top-2 z-[2] bg-[#f8f6f1]/95 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#713b4d] sm:left-3 sm:top-3 sm:px-2.5">Featured</span>}
                  {product.quantity === 0 && <span className="absolute bottom-2 left-2 z-[2] bg-[#25211e]/90 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-white sm:bottom-3 sm:left-3">Sold out</span>}
                  {product.quantity > 0 && product.quantity <= 3 && <span className="absolute bottom-2 left-2 z-[2] bg-[#f8f6f1]/95 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-[#713b4d] sm:bottom-3 sm:left-3">Only {product.quantity} left</span>}
                  <button type="button" onClick={() => openQuickView(product)} className="absolute bottom-2 right-2 z-[3] bg-[#f8f6f1]/95 px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#302923] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a45168] sm:bottom-3 sm:right-3 sm:px-3 sm:text-[10px]">Quick view</button>
                </div>
                <div className="pt-3 sm:pt-4">
                  <p className="truncate text-[9px] uppercase tracking-[0.16em] text-stone-500 sm:text-[10px]">{product.category}</p>
                  <Link href={`/shop/${product.id}`} className="mt-1 block"><h3 className="line-clamp-2 min-h-10 font-serif text-base leading-snug text-[#2e2824] transition-colors group-hover:text-[#713b4d] sm:text-lg">{product.name}</h3></Link>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1"><p className="text-sm font-medium tabular-nums text-[#302923] sm:text-base">{formatMoney(product.price, currency)}</p><span className={`text-[9px] uppercase tracking-[0.1em] ${product.quantity > 0 ? "text-stone-500" : "text-stone-400"}`}>{product.quantity > 0 ? "In stock" : "Unavailable"}</span></div>
                  <div className="mt-3 flex items-center gap-3">
                    <button type="button" disabled={product.quantity <= 0} onClick={() => addProduct(product)} className="min-h-10 flex-1 border border-[#392f29] px-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#302923] transition-colors hover:bg-[#302923] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a45168] disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400 disabled:hover:bg-transparent disabled:hover:text-stone-400 sm:text-[10px]">{addedProductId === product.id ? <span className="inline-flex items-center gap-1"><Check size={13}/> Added</span> : product.quantity > 0 ? "Add to bag" : "Sold out"}</button>
                    <Link href={`/shop/${product.id}`} className="hidden text-[10px] uppercase tracking-[0.12em] text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline focus-visible:outline-2 focus-visible:outline-[#a45168] sm:inline">Details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-xl py-20 text-center sm:py-28">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#a45168]">A fresh start</p>
            <h3 className="mt-3 font-serif text-3xl">{products.length ? "No pieces match your search" : "The collection is being refreshed"}</h3>
            <p className="mt-3 text-sm leading-6 text-stone-600">{products.length ? "Try another search or clear your filters to explore the full collection." : "Please check back soon, or contact us for help finding something."}</p>
            {products.length ? <button type="button" onClick={clearFilters} className="mt-6 border-b border-[#a45168] pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#713b4d]">Clear filters</button> : <Link href="/contact" className="mt-6 inline-block border-b border-[#a45168] pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#713b4d]">Contact us</Link>}
          </div>
        )}

        {totalPages > 1 && <nav aria-label="Product pages" className="mt-14 flex items-center justify-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => { setPage((value) => Math.max(1, value - 1)); document.getElementById("collection")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }} className="min-h-10 px-3 text-xs uppercase tracking-[0.12em] text-stone-600 disabled:opacity-40">Previous</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} type="button" aria-current={number === page ? "page" : undefined} onClick={() => setPage(number)} className={`h-10 min-w-10 border text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a45168] ${number === page ? "border-[#302923] bg-[#302923] text-white" : "border-[#d9d2c8] text-stone-700 hover:border-[#302923]"}`}>{number}</button>)}
          <button type="button" disabled={page >= totalPages} onClick={() => { setPage((value) => Math.min(totalPages, value + 1)); document.getElementById("collection")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }} className="min-h-10 px-3 text-xs uppercase tracking-[0.12em] text-stone-600 disabled:opacity-40">Next</button>
        </nav>}
      </section>

      <AnimatePresence>
        {filtersOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} className="fixed inset-0 z-[70] bg-black/35 md:hidden" onMouseDown={(event) => { if (event.target === event.currentTarget) setFiltersOpen(false); }}>
          <motion.section data-shop-dialog role="dialog" aria-modal="true" aria-labelledby="mobile-filters-title" initial={{ y: reduceMotion ? 0 : "100%" }} animate={{ y: 0 }} exit={{ y: reduceMotion ? 0 : "100%" }} transition={{ duration: reduceMotion ? 0 : 0.24 }} className="absolute inset-x-0 bottom-0 bg-[#f8f6f1] px-5 pb-8 pt-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d9d2c8] pb-4"><h2 id="mobile-filters-title" className="font-serif text-2xl">Refine the collection</h2><button ref={closeFiltersRef} type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="p-2 focus-visible:outline-2 focus-visible:outline-[#a45168]"><X size={20}/></button></div>
            <div className="flex flex-col gap-3 py-4">{filterFields}<label className="flex items-center gap-2 border-b border-[#d9d2c8] py-3 text-xs uppercase tracking-[0.12em] text-stone-500">Category<select value={category} onChange={(event) => { selectCategory(event.target.value); }} className="ml-auto max-w-48 bg-transparent py-2 text-sm normal-case tracking-normal text-stone-800"><option>All</option>{categories.map((name) => <option key={name}>{name}</option>)}</select></label></div>
            <div className="flex gap-3"><button type="button" onClick={clearFilters} className="min-h-12 flex-1 border border-[#302923] text-xs font-semibold uppercase tracking-[0.12em]">Clear all</button><button type="button" onClick={() => setFiltersOpen(false)} className="min-h-12 flex-1 bg-[#302923] text-xs font-semibold uppercase tracking-[0.12em] text-white">Show {filteredProducts.length} results</button></div>
          </motion.section>
        </motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {quickView && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setQuickView(null); }}>
          <motion.section data-shop-dialog role="dialog" aria-modal="true" aria-labelledby="quick-view-title" initial={{ opacity: 0, y: reduceMotion ? 0 : 14, scale: reduceMotion ? 1 : 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 10 }} transition={{ duration: reduceMotion ? 0 : 0.2 }} className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-[#f8f6f1] md:grid-cols-2">
            <button ref={closeQuickViewRef} type="button" onClick={() => setQuickView(null)} aria-label="Close quick view" className="absolute right-3 top-3 z-10 bg-[#f8f6f1]/90 p-2 text-[#302923] focus-visible:outline-2 focus-visible:outline-[#a45168]"><X size={20}/></button>
            <div className="relative min-h-64 bg-[#eeeae3] sm:min-h-80 md:min-h-[520px]"><Image src={quickView.image} alt={quickView.imageAlt?.trim() || quickView.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-8"/></div>
            <div className="flex flex-col p-6 sm:p-9 md:justify-center md:p-12"><p className="text-[10px] uppercase tracking-[0.2em] text-[#a45168]">{quickView.category}</p><h2 id="quick-view-title" className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">{quickView.name}</h2><p className="mt-4 text-lg tabular-nums">{formatMoney(quickView.price, currency)}</p><p className="mt-5 line-clamp-5 text-sm leading-7 text-stone-600">{quickView.description}</p>
              <p className={`mt-4 text-xs uppercase tracking-[0.12em] ${quickView.quantity > 0 ? "text-stone-500" : "text-[#713b4d]"}`}>{quickView.quantity > 0 ? `${quickView.quantity} available` : "Currently unavailable"}</p>
              {quickView.quantity > 0 && <label className="mt-5 flex items-center gap-4 text-xs uppercase tracking-[0.12em] text-stone-600">Quantity<input type="number" min={1} max={Math.min(99, quickView.quantity)} value={quickQuantity} onChange={(event) => setQuickQuantity(Math.min(Math.min(99, quickView.quantity), Math.max(1, Number(event.target.value) || 1)))} className="h-11 w-20 border border-[#d9d2c8] bg-transparent px-3 text-sm text-[#302923]"/></label>}
              <button type="button" disabled={quickView.quantity <= 0} onClick={() => addProduct(quickView, quickQuantity)} className="mt-6 min-h-12 w-full bg-[#302923] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#713b4d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a45168] disabled:cursor-not-allowed disabled:bg-stone-300">{quickView.quantity > 0 ? "Add to bag" : "Sold out"}</button>
              <Link href={`/shop/${quickView.id}`} onClick={() => setQuickView(null)} className="mt-4 self-start border-b border-[#a45168] pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#713b4d]">View full details</Link>
            </div>
          </motion.section>
        </motion.div>}
      </AnimatePresence>
    </main>
  );
}
