"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  formatCurrency,
  formatInvoicePeriod,
  statusBadgeVariant,
} from "@/lib/format";
import { EditIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import type { ActionResult } from "@/lib/api";

enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
}

export interface InvoiceForRow {
  id: string;
  month: number;
  year: number;
  adSpend: number;
  fee: number;
  status: InvoiceStatus;
}

interface InvoiceRowProps {
  invoice: InvoiceForRow;
  onUpdated: () => void;
  onUpdateAdSpend: (id: string, adSpend: number) => Promise<ActionResult>;
  onUpdateStatus: (id: string, status: InvoiceStatus) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
}

export function InvoiceRow({
  invoice,
  onUpdated,
  onUpdateAdSpend,
  onUpdateStatus,
  onDelete,
}: InvoiceRowProps) {
  const [isEditingAdSpend, setIsEditingAdSpend] = useState(false);
  const [adSpendInput, setAdSpendInput] = useState(String(invoice.adSpend));
  const [isSavingAdSpend, setIsSavingAdSpend] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isRedirectingToPay, setIsRedirectingToPay] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const isDraft = invoice.status === InvoiceStatus.DRAFT;
  const canMarkSent = invoice.status === InvoiceStatus.DRAFT;
  const canPay = invoice.status === InvoiceStatus.SENT;
  const canDelete =
    invoice.status === InvoiceStatus.DRAFT ||
    invoice.status === InvoiceStatus.SENT;

  async function handleSaveAdSpend() {
    const value = Number(adSpendInput);
    if (Number.isNaN(value) || value < 0) {
      setRowError("Ad spend must be a non-negative number");
      return;
    }
    setRowError(null);
    setIsSavingAdSpend(true);
    const result = await onUpdateAdSpend(invoice.id, value);
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
    const result = await onUpdateStatus(invoice.id, newStatus);
    setIsChangingStatus(false);
    if (result.success) {
      onUpdated();
    } else {
      setRowError(result.error ?? "Failed to update status");
    }
  }

  async function handlePay() {
    setRowError(null);
    setIsRedirectingToPay(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/checkout`);
      const data = await res.json();
      if (!res.ok) {
        setRowError(data.error ?? "Failed to get payment link");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setRowError("Payment link not available");
      }
    } catch {
      setRowError("Failed to get payment link");
    } finally {
      setIsRedirectingToPay(false);
    }
  }

  function handleCancelEdit() {
    setAdSpendInput(String(invoice.adSpend));
    setRowError(null);
    setIsEditingAdSpend(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this invoice? This action cannot be undone.")) return;
    setRowError(null);
    setIsDeleting(true);
    const result = await onDelete(invoice.id);
    setIsDeleting(false);
    if (result.success) {
      onUpdated();
    } else {
      setRowError(result.error ?? "Failed to delete");
    }
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
                {isChangingStatus ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Mark as Sent"
                )}
              </Button>
            )}
            {canPay && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handlePay}
                disabled={isRedirectingToPay}
              >
                {isRedirectingToPay ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Pay"
                )}
              </Button>
            )}
          </div>
          {rowError && (
            <span className="text-destructive text-xs">{rowError}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {canDelete && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete invoice"
          >
            {isDeleting ? "Deleting…" : <Trash2Icon className="size-4" />}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
