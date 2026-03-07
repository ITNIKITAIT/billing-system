"use server";

import { prisma } from "../../../prisma/db";

export type DashboardPlan = {
  id: string;
  name: string;
  feeRate: number;
  minFee: number;
};

export type DashboardData = {
  activeClientsCount: number;
  totalInvoicedThisMonth: number;
  averageInvoiceAmount: number;
  plans: DashboardPlan[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [activeClientsCount, thisMonthInvoices, plans] = await Promise.all([
    prisma.client.count({ where: { isActive: true } }),
    prisma.invoice.findMany({
      where: { year: currentYear, month: currentMonth },
      select: { fee: true },
    }),
    prisma.plan.findMany({
      select: { id: true, name: true, feeRate: true, minFee: true },
    }),
  ]);

  const totalInvoicedThisMonth = thisMonthInvoices.reduce(
    (sum, inv) => sum + inv.fee,
    0
  );
  const count = thisMonthInvoices.length;
  const averageInvoiceAmount = count > 0 ? totalInvoicedThisMonth / count : 0;

  return {
    activeClientsCount,
    totalInvoicedThisMonth: Math.round(totalInvoicedThisMonth * 100) / 100,
    averageInvoiceAmount: Math.round(averageInvoiceAmount * 100) / 100,
    plans,
  };
}
