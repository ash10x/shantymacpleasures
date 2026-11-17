import { getProducts } from "@/server/actions/getProducts";
import ShopClient from "./ShopClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop Intimate Products", description: "Browse the ShantyMac Pleasures collection in Montego Bay, Jamaica." };

export default async function ShopPage() {
  const allProducts = await getProducts();
  const categories = [...new Set(allProducts.map((p) => p.category))].sort();

  return <ShopClient products={allProducts} categories={categories} />;
}
