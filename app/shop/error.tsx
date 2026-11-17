"use client";

export default function ShopError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <main className="min-h-[65vh] bg-[#f8f6f1] px-6 py-32 text-center text-[#25211e]"><p className="text-[10px] uppercase tracking-[0.22em] text-[#a45168]">The collection</p><h1 className="mt-3 font-serif text-3xl">We couldn’t load the collection.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">Please try again in a moment. If the problem continues, our team can help.</p><button type="button" onClick={() => unstable_retry()} className="mt-6 border-b border-[#a45168] pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#713b4d]">Try again</button></main>;
}
