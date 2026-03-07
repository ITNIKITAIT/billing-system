export function calculateFee(
  adSpend: number,
  feeRate: number,
  minFee: number,
  discount: number
): number {
  const calculated = adSpend * feeRate;
  const afterMinimum = Math.max(calculated, minFee);
  const afterDiscount = afterMinimum * (1 - discount / 100);
  return Math.round(afterDiscount * 100) / 100;
}
