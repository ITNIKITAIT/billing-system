import { getClients } from "@/lib/services/client.service";
import { ClientsPageHeader } from "../../components/clients/clients-page-header";
import { ClientsTable } from "../../components/clients/clients-table";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <>
      <ClientsPageHeader />
      <ClientsTable clients={clients} />
    </>
  );
}
