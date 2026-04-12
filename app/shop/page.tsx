import { getProducts } from "@/server/actions/getProducts";
import ShopClient from "./ShopClient";

export default async function ShopPage() {
  const allProducts = await getProducts();
  const categories = [...new Set(allProducts.map((p) => p.category))].sort();

  return <ShopClient products={allProducts} categories={categories} />;
}
