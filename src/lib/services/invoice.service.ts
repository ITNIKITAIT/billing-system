"use server";

import { InvoiceStatus } from "@prisma/client";
import { prisma } from "../../../prisma/db";
import { calculateFee, getProrationRatio } from "@/lib/billing";
import {
  generateInvoiceFormSchema,
  type GenerateInvoiceFormValues,
} from "@/lib/schemas/invoice";

const VALID_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: [InvoiceStatus.SENT],
  SENT: [InvoiceStatus.PAID],
  PAID: [],
};

export async function getInvoicesByClient(clientId: string) {
  return prisma.invoice.findMany({
    where: { clientId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: { client: { include: { plan: true } } },
  });
}

export async function createInvoice(
  clientId: string,
  input: GenerateInvoiceFormValues
) {
  const { year, month, adSpend } = generateInvoiceFormSchema.parse(input);

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { plan: true },
  });
  if (!client) {
    return { success: false, error: "Client not found" };
  }
  if (!client.plan) {
    return {
      success: false,
      error: "Client must have a plan to create an invoice",
    };
  }

  const existingInvoice = await prisma.invoice.findUnique({
    where: { clientId_month_year: { clientId, year, month } },
  });
  if (existingInvoice) {
    return { success: false, error: "Invoice already exists" };
  }

  const prorationRatio = getProrationRatio(
    client.subscriptionStartDate,
    year,
    month
  );
  const fee = calculateFee(
    adSpend,
    client.plan.feeRate,
    client.plan.minFee,
    client.discount,
    prorationRatio
  );

  try {
    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        year,
        month,
        adSpend,
        fee,
      },
    });
    return { success: true, invoice };
  } catch (e: unknown) {
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: { include: { plan: true } } },
  });
  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  const allowed = VALID_TRANSITIONS[invoice.status];
  if (!allowed.includes(status)) {
    if (invoice.status === InvoiceStatus.PAID) {
      return { success: false, error: "Paid invoices cannot be reverted" };
    }
    return {
      success: false,
      error: `Status can only transition from ${invoice.status} to ${allowed.join(" or ")}`,
    };
  }

  const updateData: { status: InvoiceStatus; paidAt?: Date } = { status };
  if (status === InvoiceStatus.PAID) {
    updateData.paidAt = new Date();
  }

  try {
    const updated = await prisma.invoice.update({
      where: { id },
      data: updateData,
    });
    return { success: true, invoice: updated };
  } catch (e) {
    console.error("updateInvoiceStatus", e);
    return { success: false, error: "Failed to update invoice" };
  }
}

const DELETABLE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.DRAFT,
  InvoiceStatus.SENT,
];

export async function deleteInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });
  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }
  if (!DELETABLE_STATUSES.includes(invoice.status)) {
    return {
      success: false,
      error: "Only draft or sent invoices can be deleted",
    };
  }

  try {
    await prisma.invoice.delete({
      where: { id },
    });
    return { success: true };
  } catch (e) {
    console.error("deleteInvoice", e);
    return { success: false, error: "Failed to delete invoice" };
  }
}

export async function updateInvoiceAdSpend(id: string, adSpend: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: { include: { plan: true } } },
  });
  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }
  if (invoice.status !== InvoiceStatus.DRAFT) {
    return {
      success: false,
      error: "Only draft invoices can be edited (adSpend, etc.)",
    };
  }
  if (Number.isNaN(adSpend) || adSpend < 0) {
    return { success: false, error: "adSpend must be a non-negative number" };
  }
  if (!invoice.client.plan) {
    return {
      success: false,
      error: "Client has no plan; cannot recalculate fee",
    };
  }

  const prorationRatio = getProrationRatio(
    invoice.client.subscriptionStartDate,
    invoice.year,
    invoice.month
  );
  const fee = calculateFee(
    adSpend,
    invoice.client.plan.feeRate,
    invoice.client.plan.minFee,
    invoice.client.discount,
    prorationRatio
  );

  try {
    const updated = await prisma.invoice.update({
      where: { id },
      data: { adSpend, fee },
    });
    return { success: true, invoice: updated };
  } catch (e) {
    console.error("updateInvoiceAdSpend", e);
    return { success: false, error: "Failed to update invoice" };
  }
}
