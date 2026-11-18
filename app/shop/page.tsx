import { getProducts } from "@/server/actions/getProducts";
import ShopClient from "./ShopClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop Intimate Products", description: "Browse the ShantyMac Pleasures collection in Montego Bay, Jamaica." };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const params = await searchParams;
  const allProducts = await getProducts();
  const categories = [...new Set(allProducts.map((p) => p.category))].sort();
  const requestedCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const initialCategory = requestedCategory && categories.includes(requestedCategory) ? requestedCategory : "All";

  return <ShopClient products={allProducts} categories={categories} initialCategory={initialCategory} />;
}
