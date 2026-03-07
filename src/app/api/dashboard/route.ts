import { NextResponse } from "next/server";
import { prisma } from "../../../prisma/db";

export async function GET() {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const [activeClientsCount, thisMonthInvoices] = await Promise.all([
      prisma.client.count({ where: { isActive: true } }),
      prisma.invoice.findMany({
        where: { year: currentYear, month: currentMonth },
        select: { fee: true },
      }),
    ]);

    const totalInvoicedThisMonth = thisMonthInvoices.reduce(
      (sum, inv) => sum + inv.fee,
      0
    );
    const count = thisMonthInvoices.length;
    const averageInvoiceAmount = count > 0 ? totalInvoicedThisMonth / count : 0;

    return NextResponse.json({
      activeClientsCount,
      totalInvoicedThisMonth: Math.round(totalInvoicedThisMonth * 100) / 100,
      averageInvoiceAmount: Math.round(averageInvoiceAmount * 100) / 100,
    });
  } catch (e) {
    console.error("GET /api/dashboard", e);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
