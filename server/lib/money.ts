/** Product prices and order totals are stored and displayed as whole JMD. */
export function formatMoney(amountJmd: number) {
  return new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency: "JMD",
    currencyDisplay: "code",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountJmd);
}
