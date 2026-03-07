import { getPlans } from "@/lib/services/plan.service";
import { updateClient } from "@/lib/services/client.service";
import { ClientForm } from "../_components/client-form";
import { BackButton } from "@/components/shared/back-button";
import { getClient } from "@/lib/services/client.service";
import { notFound } from "next/navigation";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) {
    return notFound();
  }
  const plans = await getPlans();

  return (
    <>
      <BackButton href="/clients" />
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
        successRedirect="/clients"
        submitLabel="Update client"
        title="Update client"
        description="Update an agency client and assign a plan."
      />
    </>
  );
}
