import type { Metadata } from "next";
import { getProducts } from "@/server/actions/getProducts";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Intimate Essentials, Thoughtfully Chosen",
  description: "Explore ShantyMac Pleasures: a considered collection of intimate essentials from Montego Bay, Jamaica.",
  alternates: { canonical: "/" },
  openGraph: { title: "ShantyMac Pleasures | Pleasure, Reimagined", description: "A considered collection for confidence, connection, and the rituals that are entirely your own.", url: "/", images: [{ url: "/images/home-editorial.webp", width: 1200, height: 800, alt: "ShantyMac Pleasures editorial campaign" }] },
  twitter: { card: "summary_large_image", title: "ShantyMac Pleasures | Pleasure, Reimagined", description: "Discover intimate essentials from Montego Bay, Jamaica.", images: ["/images/home-editorial.webp"] },
};

export default async function HomePage() {
  const catalog = await getProducts();
  const featuredProducts = catalog.filter((product) => product.featured);
  const categories = [...new Set(catalog.map((product) => product.category))].sort().map((name) => {
    const product = catalog.find((item) => item.category === name)!;
    return { name, image: product.image, alt: product.imageAlt || `${name} collection` };
  });
  return <HomeClient featuredProducts={featuredProducts} categories={categories} />;
}
