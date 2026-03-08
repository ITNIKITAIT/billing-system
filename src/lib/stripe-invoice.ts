import { stripe } from "./stripe";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createInvoiceCheckoutSession(
  invoiceId: string,
  clientId: string,
  amount: number,
  clientEmail: string,
  description: string
): Promise<{ sessionId: string; url: string } | null> {
  const amountCents = Math.round(amount * 100);
  if (amountCents < 50) {
    return null;
  }

  const baseUrl = getBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: description,
            description: `Invoice payment`,
          },
        },
        quantity: 1,
      },
    ],
    client_reference_id: invoiceId,
    metadata: { invoiceId, clientId },
    customer_email: clientEmail,
    success_url: `${baseUrl}/clients/${clientId}?payment=success`,
    cancel_url: `${baseUrl}/clients/${clientId}?payment=cancelled`,
  });

  if (!session.url) return null;
  return { sessionId: session.id, url: session.url };
}

export async function getOrCreateCheckoutUrl(
  invoiceId: string,
  existingSessionId: string | null,
  clientId: string,
  amount: number,
  clientEmail: string,
  description: string
): Promise<string | null> {
  if (existingSessionId) {
    const session = await stripe.checkout.sessions.retrieve(existingSessionId);
    if (session.status === "open" && session.url) {
      return session.url;
    }
  }

  const result = await createInvoiceCheckoutSession(
    invoiceId,
    clientId,
    amount,
    clientEmail,
    description
  );
  return result?.url ?? null;
}
