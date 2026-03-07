"use server";

import { clientFormSchema, ClientFormValues } from "@/lib/schemas/client";
import { prisma } from "../../../prisma/db";

export const getClients = async () => {
  const clients = await prisma.client.findMany({
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
  return clients;
};

export const getClient = async (id: string) => {
  return prisma.client.findUnique({
    where: { id },
    include: { plan: true },
  });
};

export const createClient = async (input: ClientFormValues) => {
  const { name, email, planId, discount, isActive } =
    clientFormSchema.parse(input);

  const existingClient = await prisma.client.findUnique({ where: { email } });
  if (existingClient) {
    return { success: false, error: "Client with this email already exists." };
  }

  if (planId) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return { success: false, error: "Plan not found." };
    }
  }

  const subscriptionStartDate = planId ? new Date() : null;

  try {
    await prisma.client.create({
      data: {
        name,
        email,
        planId: planId || null,
        discount,
        subscriptionStartDate,
        isActive,
      },
    });
    return { success: true };
  } catch (e: unknown) {
    console.error("createClient", e);
    return { success: false, error: "Failed to create client." };
  }
};

export const updateClient = async (id: string, input: ClientFormValues) => {
  const { name, email, planId, discount, isActive } =
    clientFormSchema.parse(input);

  if (planId) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return { success: false, error: "Plan not found." };
    }
  }

  const subscriptionStartDate = planId ? new Date() : null;

  try {
    await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        planId: planId || null,
        discount,
        subscriptionStartDate,
        isActive,
      },
    });
    return { success: true };
  } catch (e: unknown) {
    console.error("updateClient", e);
    return { success: false, error: "Failed to update client." };
  }
};
