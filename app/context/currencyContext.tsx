"use client";

import { createContext, useContext, useState } from "react";

export type CurrencyCode = "USD" | "JMD";

const CurrencyContext = createContext<{
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
} | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
}
