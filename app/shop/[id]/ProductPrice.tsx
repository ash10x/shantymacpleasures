"use client";

import { useCurrency } from "@/app/context/currencyContext";
import { formatMoney } from "@/server/lib/money";

export default function ProductPrice({ minorUnits }: { minorUnits: number }) {
  const { currency } = useCurrency();
  return <>{formatMoney(minorUnits, currency)}</>;
}
