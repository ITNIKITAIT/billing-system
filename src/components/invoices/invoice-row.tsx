"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  updateInvoiceAdSpend,
  updateInvoiceStatus,
} from "@/lib/services/invoice.service";
import { Invoice, InvoiceStatus } from "@prisma/client";
import {
  formatCurrency,
  formatInvoicePeriod,
  statusBadgeVariant,
} from "@/lib/format";
import { EditIcon } from "lucide-react";

interface InvoiceRowProps {
  invoice: Invoice;
  onUpdated: () => void;
}

export function InvoiceRow({ invoice, onUpdated }: InvoiceRowProps) {
  const [isEditingAdSpend, setIsEditingAdSpend] = useState(false);
  const [adSpendInput, setAdSpendInput] = useState(String(invoice.adSpend));
  const [isSavingAdSpend, setIsSavingAdSpend] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const isDraft = invoice.status === InvoiceStatus.DRAFT;
  const canMarkSent = invoice.status === InvoiceStatus.DRAFT;
  const canMarkPaid = invoice.status === InvoiceStatus.SENT;

  async function handleSaveAdSpend() {
    const value = Number(adSpendInput);
    if (Number.isNaN(value) || value < 0) {
      setRowError("Ad spend must be a non-negative number");
      return;
    }
    setRowError(null);
    setIsSavingAdSpend(true);
    const result = await updateInvoiceAdSpend(invoice.id, value);
    setIsSavingAdSpend(false);

    if (result.success) {
      setIsEditingAdSpend(false);
      onUpdated();
    } else {
      setRowError(result.error ?? "Failed to update");
    }
  }

  async function handleStatusChange(newStatus: InvoiceStatus) {
    setRowError(null);
    setIsChangingStatus(true);
    const result = await updateInvoiceStatus(invoice.id, newStatus);
    setIsChangingStatus(false);
    if (result.success) {
      onUpdated();
    } else {
      setRowError(result.error ?? "Failed to update status");
    }
  }

  function handleCancelEdit() {
    setAdSpendInput(String(invoice.adSpend));
    setRowError(null);
    setIsEditingAdSpend(false);
  }

  return (
    <TableRow>
      <TableCell>{formatInvoicePeriod(invoice.month, invoice.year)}</TableCell>
      <TableCell className="text-right">
        {isDraft && isEditingAdSpend ? (
          <div className="flex items-center justify-end gap-1">
            <Input
              type="number"
              min={0}
              step={0.01}
              className="h-8 w-24 text-right"
              value={adSpendInput}
              onChange={(e) => setAdSpendInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveAdSpend();
                if (e.key === "Escape") handleCancelEdit();
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleSaveAdSpend}
              disabled={isSavingAdSpend}
            >
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={isSavingAdSpend}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <span
            className={
              isDraft
                ? "cursor-pointer flex items-center justify-end gap-1"
                : ""
            }
          >
            {formatCurrency(invoice.adSpend)}
            {isDraft && !isEditingAdSpend && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="ml-1 h-6 px-1 text-muted-foreground"
                onClick={() => {
                  setRowError(null);
                  setIsEditingAdSpend(true);
                }}
                aria-label="Edit ad spend"
              >
                <EditIcon className="size-4" />
              </Button>
            )}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(invoice.fee)}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusBadgeVariant(invoice.status)}>
              {invoice.status}
            </Badge>
            {canMarkSent && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange(InvoiceStatus.SENT)}
                disabled={isChangingStatus}
              >
                {isChangingStatus ? "…" : "Mark as Sent"}
              </Button>
            )}
            {canMarkPaid && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange(InvoiceStatus.PAID)}
                disabled={isChangingStatus}
              >
                {isChangingStatus ? "…" : "Mark as Paid"}
              </Button>
            )}
          </div>
          {rowError && (
            <span className="text-destructive text-xs">{rowError}</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
