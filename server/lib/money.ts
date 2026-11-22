// Prices remain stored as whole USD dollars; storefront amounts are shown in JMD.
const configuredRate = Number(process.env.NEXT_PUBLIC_USD_TO_JMD_RATE);
const USD_TO_JMD_RATE = Number.isFinite(configuredRate) && configuredRate > 0 ? configuredRate : 158.463;

export function convertUsdToJmd(usdDollars: number) {
  return Math.round(usdDollars * USD_TO_JMD_RATE);
}

export function formatMoney(usdDollars: number) {
  return new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency: "JMD",
    currencyDisplay: "code",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(convertUsdToJmd(usdDollars));
}
