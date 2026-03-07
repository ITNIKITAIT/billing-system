import { NextRequest, NextResponse } from "next/server";
import { InvoiceStatus } from "@prisma/client";
import {
  getInvoice,
  updateInvoiceStatus,
  updateInvoiceAdSpend,
} from "@/lib/services/invoice.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const invoice = await getInvoice(id);
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
    const invoice = await getInvoice(id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status, adSpend } = body;

    if (status !== undefined) {
      const result = await updateInvoiceStatus(id, status as InvoiceStatus);
      if (result.success) {
        return NextResponse.json(result.invoice);
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (adSpend !== undefined) {
      const result = await updateInvoiceAdSpend(id, Number(adSpend));
      if (result.success) {
        return NextResponse.json(result.invoice);
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(invoice);
  } catch (e) {
    console.error("PATCH /api/invoices/[id]", e);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}
