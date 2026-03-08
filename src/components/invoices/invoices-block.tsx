"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GenerateInvoiceForm } from "./generate-invoice-form";
import { InvoicesTable } from "./invoices-table";
import type { InvoiceForRow } from "./invoice-row";
import type { ActionResult } from "@/lib/api";
import { InvoiceStatus } from "@prisma/client";

interface InvoicesBlockProps {
  clientId: string;
  invoices: InvoiceForRow[];
  hasPlan: boolean;
  onUpdateAdSpend: (id: string, adSpend: number) => Promise<ActionResult>;
  onUpdateStatus: (id: string, status: InvoiceStatus) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
}

export function InvoicesBlock({
  clientId,
  invoices,
  hasPlan,
  onUpdateAdSpend,
  onUpdateStatus,
  onDelete,
}: InvoicesBlockProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  function handleGenerateSuccess() {
    setShowForm(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>
          Invoice history and generate new invoice for this client.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm ? (
          <GenerateInvoiceForm
            clientId={clientId}
            onSuccess={handleGenerateSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <Button
            type="button"
            onClick={() => setShowForm(true)}
            disabled={!hasPlan}
          >
            Generate invoice
          </Button>
        )}
        {!hasPlan && (
          <p className="text-sm text-muted-foreground">
            Assign a plan to this client to generate invoices.
          </p>
        )}

        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No invoices yet for this client.
          </p>
        ) : (
          <InvoicesTable
            invoices={invoices}
            onUpdateAdSpend={onUpdateAdSpend}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
          />
        )}
      </CardContent>
    </Card>
  );
}
