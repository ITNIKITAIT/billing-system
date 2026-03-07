"use server";

import { prisma } from "../../../prisma/db";

export const getPlans = async () => {
  return prisma.plan.findMany({
    orderBy: { name: "asc" },
  });
};
