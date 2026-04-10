import { getBestsellers, getFeaturedProducts } from "@/server/actions/getProducts";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const [bestsellers, featuredProducts] = await Promise.all([
    getBestsellers(),
    getFeaturedProducts(),
  ]);

  return <HomeClient bestsellers={bestsellers} featuredProducts={featuredProducts} />;
}

