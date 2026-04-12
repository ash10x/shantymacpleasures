import { getProducts } from "@/server/actions/getProducts";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductsClient products={products} />;
}
