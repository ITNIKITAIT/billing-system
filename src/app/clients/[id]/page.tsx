import { getPlans } from "@/lib/services/plan.service";
import { updateClient, getClient } from "@/lib/services/client.service";
import {
  getInvoicesByClient,
  updateInvoiceAdSpend,
  updateInvoiceStatus,
  deleteInvoice,
} from "@/lib/services/invoice.service";
import { ClientForm } from "@/components/clients/client-form";
import { BackButton } from "@/components/shared/back-button";
import { notFound } from "next/navigation";
import { InvoicesBlock } from "@/components/invoices/invoices-block";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, plans, invoices] = await Promise.all([
    getClient(id),
    getPlans(),
    getInvoicesByClient(id),
  ]);
  if (!client) {
    return notFound();
  }

  return (
    <>
      <BackButton href="/clients" />
      <div className="space-y-6">
        <InvoicesBlock
          clientId={id}
          invoices={invoices}
          hasPlan={Boolean(client.planId)}
          onUpdateAdSpend={updateInvoiceAdSpend}
          onUpdateStatus={updateInvoiceStatus}
          onDelete={deleteInvoice}
        />
        <ClientForm
          plans={plans}
          defaultValues={{
            id: client.id,
            name: client.name,
            email: client.email,
            planId: client.planId ?? undefined,
            discount: client.discount,
            isActive: client.isActive,
          }}
          submitAction={updateClient.bind(null, id)}
          successRedirect={`/clients/${id}`}
          submitLabel="Update client"
          title="Update client"
          description="Update an agency client and assign a plan."
        />
      </div>
    </>
  );
}
