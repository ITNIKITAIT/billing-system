import { NextRequest, NextResponse } from "next/server";
import { getInvoice } from "@/lib/services/invoice.service";
import { InvoiceStatus } from "@prisma/client";
import { getOrCreateCheckoutUrl } from "@/lib/stripe-invoice";

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
    if (invoice.status !== InvoiceStatus.SENT) {
      return NextResponse.json(
        { error: "Only sent invoices can be paid" },
        { status: 400 }
      );
    }

    const url = await getOrCreateCheckoutUrl(
      invoice.id,
      invoice.stripeCheckoutSessionId,
      invoice.clientId,
      invoice.fee,
      invoice.client.email,
      `Invoice ${invoice.month}/${invoice.year}`
    );

    if (!url) {
      return NextResponse.json(
        { error: "Could not create payment session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (e) {
    console.error("GET /api/invoices/[id]/checkout", e);
    return NextResponse.json(
      { error: "Failed to get checkout URL" },
      { status: 500 }
    );
  }
}
