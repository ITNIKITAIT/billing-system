import { NextRequest, NextResponse } from "next/server";
import {
  getInvoicesByClient,
  createInvoice,
} from "@/lib/services/invoice.service";

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
    const invoices = await getInvoicesByClient(clientId);
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
    const result = await createInvoice(clientId, {
      year: Number(year),
      month: Number(month),
      adSpend: Number(adSpend ?? 0),
    });
    if (result.success) {
      return NextResponse.json(result.invoice);
    }
    const status =
      result.error === "Client not found"
        ? 404
        : result.error?.includes("already exists")
          ? 409
          : 400;
    return NextResponse.json({ error: result.error }, { status });
  } catch (e) {
    console.error("POST /api/invoices", e);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
