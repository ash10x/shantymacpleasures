import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Support", robots: { index: false, follow: false } };

export default function OrdersPage() {
  return <main className="min-h-[60vh] px-6 py-32"><section className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm"><h1 className="text-3xl font-semibold">Order Support</h1><p className="mt-4 text-black/65">Secure online order history is not available yet. For an update, contact us with the order number from your confirmation.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><a className="rounded-full bg-pink-600 px-6 py-3 font-semibold text-white" href="mailto:shantymacpleasures@yahoo.com">Email ShantyMac</a><a className="rounded-full border border-black/20 px-6 py-3" href="tel:+18763121862">Call +1 876 312 1862</a></div></section></main>;
}
