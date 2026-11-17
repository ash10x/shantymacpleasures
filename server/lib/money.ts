export function formatMoney(minorUnits: number) {
  const currency = process.env.NEXT_PUBLIC_SHOP_CURRENCY;
  if (!currency || !/^[A-Z]{3}$/.test(currency)) {
    return `${(minorUnits / 100).toFixed(2)} (store currency not configured)`;
  }
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(minorUnits / 100) + ` ${currency}`;
}
