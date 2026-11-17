// Indicative mid-rate: midpoint of the BOJ weighted buy/sell rates for 2026-11-16.
// Override with NEXT_PUBLIC_USD_TO_JMD_RATE and update its as-of date when refreshed.
export const USD_TO_JMD_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_JMD_RATE) || 158.463;
export const FX_RATE_AS_OF = process.env.NEXT_PUBLIC_FX_RATE_AS_OF || "2026-11-16";

export function formatMoney(usdMinorUnits: number, currency: "USD" | "JMD" = "USD") {
  const usdAmount = usdMinorUnits / 100;
  const amount = currency === "JMD" ? Math.round(usdAmount * USD_TO_JMD_RATE) : usdAmount;
  return new Intl.NumberFormat(currency === "JMD" ? "en-JM" : "en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: currency === "JMD" ? 0 : 2,
    maximumFractionDigits: currency === "JMD" ? 0 : 2,
  }).format(amount);
}
