import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductById } from "../../../server/actions/getProducts";
import AddToCartButton from "./AddToCartButton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) notFound();

  return (
    <div className="relative max-w-5xl mx-auto px-6 py-36">
      {/* Back link */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 transition-colors mb-8 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        Back to Shop
      </Link>

      {/* Ambient glow */}
      <div className="absolute w-md h-112 bg-pink-500/20 blur-[120px] rounded-full top-10 -left-32 pointer-events-none" />
      <div className="absolute w-md h-112 bg-purple-500/20 blur-[120px] rounded-full bottom-0 -right-32 pointer-events-none" />

      <div className="relative bg-white/80 backdrop-blur rounded-3xl border border-black/10 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Product image */}
        <div className="flex items-center justify-center bg-pink-50/40 p-10">
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            className="object-contain max-h-80 w-auto"
          />
        </div>

        {/* Product details */}
        <div className="flex flex-col justify-between p-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-pink-500">
              {product.category}
            </span>
            <h1 className="mt-2 text-3xl font-semibold text-gray-800">
              {product.name}
            </h1>
            <p className="mt-4 text-gray-500 text-sm leading-relaxed">
              {product.description}
            </p>
            <p className="mt-6 text-2xl font-bold bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              ${product.price}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
            </p>
          </div>

          <div className="mt-8">
            <AddToCartButton
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
