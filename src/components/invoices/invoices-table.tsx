"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceRow } from "./invoice-row";
import type { InvoiceForRow } from "./invoice-row";
import type { ActionResult } from "@/lib/api";
import type { InvoiceStatus } from "@prisma/client";

interface InvoicesTableProps {
  invoices: InvoiceForRow[];
  onUpdateAdSpend: (id: string, adSpend: number) => Promise<ActionResult>;
  onUpdateStatus: (id: string, status: InvoiceStatus) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
}

export function InvoicesTable({
  invoices,
  onUpdateAdSpend,
  onUpdateStatus,
  onDelete,
}: InvoicesTableProps) {
  const router = useRouter();

  function handleUpdated() {
    router.refresh();
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead className="text-right">Ad spend</TableHead>
          <TableHead className="text-right">Fee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <InvoiceRow
            key={inv.id}
            invoice={inv}
            onUpdated={handleUpdated}
            onUpdateAdSpend={onUpdateAdSpend}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
}
