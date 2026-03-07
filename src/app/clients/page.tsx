import { getClients } from "@/lib/services/client.service";
import { ClientsPageHeader } from "./_components/clients-page-header";
import { ClientsTable } from "./_components/clients-table";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <>
      <ClientsPageHeader />
      <ClientsTable clients={clients} />
    </>
  );
}
