import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { updateInvoiceStatus } from "@/lib/services/invoice.service";
import { InvoiceStatus } from "@prisma/client";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoiceId;
    if (!invoiceId) {
      console.error(
        "checkout.session.completed: missing invoiceId in metadata"
      );
      return NextResponse.json({ received: true });
    }

    const result = await updateInvoiceStatus(invoiceId, InvoiceStatus.PAID);
    if (!result.success) {
      console.error("Failed to mark invoice as paid:", result.error);
    }
  }

  return NextResponse.json({ received: true });
}
