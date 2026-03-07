import type { InvoiceStatus } from "@prisma/client";

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatInvoicePeriod(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function statusBadgeVariant(
  status: InvoiceStatus
): "default" | "secondary" | "outline" {
  switch (status) {
    case "PAID":
      return "default";
    case "SENT":
      return "secondary";
    default:
      return "outline";
  }
}
