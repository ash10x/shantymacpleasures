"use client";

import { formatMoney } from "@/server/lib/money";

export default function ProductPrice({ amountJmd }: { amountJmd: number }) {
  return <>{formatMoney(amountJmd)}</>;
}
