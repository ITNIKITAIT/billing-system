export function getProrationRatio(
  subscriptionStartDate: Date | null,
  invoiceYear: number,
  invoiceMonth: number
): number {
  if (!subscriptionStartDate) return 1;

  const start = new Date(subscriptionStartDate);
  if (
    start.getFullYear() !== invoiceYear ||
    start.getMonth() + 1 !== invoiceMonth
  ) {
    return 1;
  }

  const startDay = start.getDate();
  const daysInMonth = new Date(invoiceYear, invoiceMonth, 0).getDate();
  const daysRemaining = daysInMonth - startDay;
  const ratio = Math.max(0, daysRemaining) / daysInMonth;
  return Math.min(1, Math.max(0, ratio));
}

export function calculateFee(
  adSpend: number,
  feeRate: number,
  minFee: number,
  discount: number,
  prorationRatio: number = 1
): number {
  const calculated = adSpend * feeRate;
  const afterMinimum = Math.max(calculated, minFee) * prorationRatio;
  const afterDiscount = afterMinimum * (1 - discount / 100);
  return Math.round(afterDiscount * 100) / 100;
}
