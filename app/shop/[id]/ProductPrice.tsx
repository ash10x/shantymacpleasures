"use client";

import { formatMoney } from "@/server/lib/money";

export default function ProductPrice({ usdDollars }: { usdDollars: number }) {
  return <>{formatMoney(usdDollars)}</>;
}
