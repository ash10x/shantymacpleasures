export default function ShopLoading() {
  return <main className="min-h-screen bg-[#f8f6f1] px-4 pb-24 pt-28 text-[#25211e] sm:px-8 lg:px-12" aria-label="Loading the collection" aria-busy="true">
    <div className="mx-auto max-w-[1440px]">
      <div className="grid min-h-[300px] animate-pulse bg-[#eee8df] md:grid-cols-2"><div className="p-10"><div className="h-3 w-40 bg-stone-300"/><div className="mt-8 h-14 max-w-md bg-stone-300"/><div className="mt-4 h-4 max-w-sm bg-stone-200"/></div><div className="min-h-56 bg-stone-200"/></div>
      <div className="mt-12 h-8 w-64 animate-pulse bg-stone-200"/><div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-7">{Array.from({ length: 8 }, (_, index) => <div key={index} className="animate-pulse"><div className="aspect-[4/5] bg-[#e9e5de]"/><div className="mt-4 h-3 w-1/3 bg-stone-200"/><div className="mt-2 h-5 w-3/4 bg-stone-200"/><div className="mt-4 h-9 bg-stone-200"/></div>)}</div>
    </div>
  </main>;
}
