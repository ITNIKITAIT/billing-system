import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../prisma/db";
import { calculateFee } from "@/lib/billing";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json(
      { error: "Query parameter clientId is required" },
      { status: 400 }
    );
  }
  try {
    const invoices = await prisma.invoice.findMany({
      where: { clientId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return NextResponse.json(invoices);
  } catch (e) {
    console.error("GET /api/invoices", e);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, year, month, adSpend } = body;

    if (typeof clientId !== "string" || !clientId.trim()) {
      return NextResponse.json(
        { error: "clientId is required and must be a non-empty string" },
        { status: 400 }
      );
    }
    const y = Number(year);
    const m = Number(month);
    if (Number.isNaN(y) || y < 2000 || y > 2100) {
      return NextResponse.json(
        { error: "year must be a valid year (2000-2100)" },
        { status: 400 }
      );
    }
    if (Number.isNaN(m) || m < 1 || m > 12) {
      return NextResponse.json(
        { error: "month must be 1-12" },
        { status: 400 }
      );
    }
    const adSpendNum = Number(adSpend);
    if (Number.isNaN(adSpendNum) || adSpendNum < 0) {
      return NextResponse.json(
        { error: "adSpend must be a non-negative number" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { plan: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    if (!client.plan) {
      return NextResponse.json(
        { error: "Client must have a plan to create an invoice" },
        { status: 400 }
      );
    }

    const fee = calculateFee(
      adSpendNum,
      client.plan.feeRate,
      client.plan.minFee,
      client.discount
    );

    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        year: y,
        month: m,
        adSpend: adSpendNum,
        fee,
      },
    });
    return NextResponse.json(invoice);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "P2002") {
      return NextResponse.json(
        {
          error: "An invoice already exists for this client and billing period",
        },
        { status: 409 }
      );
    }
    console.error("POST /api/invoices", e);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
