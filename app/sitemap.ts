import type { MetadataRoute } from "next";
import { getProducts } from "@/server/actions/getProducts";
const base = "https://www.shantymacpleasures.com";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/shop", "/about", "/contact", "/privacy", "/terms", "/shipping"];
  const products = await getProducts();
  return [
    ...pages.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path ? 0.7 : 1 })),
    ...products.map((product) => ({ url: `${base}/shop/${product.id}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
