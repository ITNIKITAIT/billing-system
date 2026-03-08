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
import type { Invoice } from "@prisma/client";

interface InvoicesTableProps {
  invoices: Invoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
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
          <InvoiceRow key={inv.id} invoice={inv} onUpdated={handleUpdated} />
        ))}
      </TableBody>
    </Table>
  );
}
