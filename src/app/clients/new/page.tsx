import { getPlans } from "@/lib/services/plan.service";
import { createClient } from "@/lib/services/client.service";
import { ClientForm } from "../../../components/clients/client-form";
import { BackButton } from "@/components/shared/back-button";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const plans = await getPlans();

  return (
    <>
      <BackButton href="/clients" />
      <ClientForm
        plans={plans}
        submitAction={createClient}
        successRedirect="/clients"
        submitLabel="Add client"
        title="Add client"
        description="Create a new agency client and assign a plan."
      />
    </>
  );
}
