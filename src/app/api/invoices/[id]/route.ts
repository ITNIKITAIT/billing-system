import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/db";
import { InvoiceStatus } from "@prisma/client";
import { calculateFee } from "@/lib/billing";

const VALID_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["SENT"],
  SENT: ["PAID"],
  PAID: [],
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: { include: { plan: true } } },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch (e) {
    console.error("GET /api/invoices/[id]", e);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: { include: { plan: true } } },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    if (status !== undefined) {
      const newStatus = status as string;
      if (!["DRAFT", "SENT", "PAID"].includes(newStatus)) {
        return NextResponse.json(
          { error: "status must be DRAFT, SENT, or PAID" },
          { status: 400 }
        );
      }
      const allowed = VALID_TRANSITIONS[invoice.status];
      if (!allowed.includes(newStatus as InvoiceStatus)) {
        if (invoice.status === "PAID") {
          return NextResponse.json(
            { error: "Paid invoices cannot be reverted" },
            { status: 400 }
          );
        }
        return NextResponse.json(
          {
            error: `Status can only transition from ${invoice.status} to ${allowed.join(" or ")}`,
          },
          { status: 400 }
        );
      }

      const updateData: { status: InvoiceStatus; paidAt?: Date } = {
        status: newStatus as InvoiceStatus,
      };
      if (newStatus === "PAID") {
        updateData.paidAt = new Date();
      }

      const updated = await prisma.invoice.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json(updated);
    }

    if (invoice.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft invoices can be edited (adSpend, etc.)" },
        { status: 400 }
      );
    }

    const { adSpend } = body;
    if (adSpend === undefined) {
      return NextResponse.json(invoice);
    }

    const adSpendNum = Number(adSpend);
    if (Number.isNaN(adSpendNum) || adSpendNum < 0) {
      return NextResponse.json(
        { error: "adSpend must be a non-negative number" },
        { status: 400 }
      );
    }

    if (!invoice.client.plan) {
      return NextResponse.json(
        { error: "Client has no plan; cannot recalculate fee" },
        { status: 400 }
      );
    }

    const fee = calculateFee(
      adSpendNum,
      invoice.client.plan.feeRate,
      invoice.client.plan.minFee,
      invoice.client.discount
    );

    const updated = await prisma.invoice.update({
      where: { id },
      data: { adSpend: adSpendNum, fee },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /api/invoices/[id]", e);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}
