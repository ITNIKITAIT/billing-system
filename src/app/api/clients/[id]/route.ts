import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../prisma/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (e) {
    console.error("GET /api/clients/[id]", e);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, planId, discount, isActive, subscriptionStartDate } =
      body;

    const data: {
      name?: string;
      email?: string;
      planId?: string;
      discount?: number;
      isActive?: boolean;
      subscriptionStartDate?: Date | null;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { error: "name must be a non-empty string" },
          { status: 400 }
        );
      }
      data.name = name.trim();
    }
    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return NextResponse.json(
          { error: "email must be a non-empty string" },
          { status: 400 }
        );
      }
      data.email = email.trim().toLowerCase();
    }
    if (planId !== undefined) {
      if (typeof planId !== "string" || !planId.trim()) {
        return NextResponse.json(
          { error: "planId must be a non-empty string" },
          { status: 400 }
        );
      }
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }
      data.planId = planId;
    }
    if (discount !== undefined) {
      const discountNum = Number(discount);
      if (Number.isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
        return NextResponse.json(
          { error: "discount must be a number between 0 and 100" },
          { status: 400 }
        );
      }
      data.discount = discountNum;
    }
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return NextResponse.json(
          { error: "isActive must be a boolean" },
          { status: 400 }
        );
      }
      data.isActive = isActive;
    }
    if (subscriptionStartDate !== undefined) {
      if (subscriptionStartDate === null || subscriptionStartDate === "") {
        data.subscriptionStartDate = null;
      } else {
        const d = new Date(subscriptionStartDate);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json(
            { error: "subscriptionStartDate must be a valid date" },
            { status: 400 }
          );
        }
        data.subscriptionStartDate = d;
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data,
      include: { plan: true },
    });
    return NextResponse.json(client);
  } catch (e: unknown) {
    const message =
      e && typeof e === "object" && "code" in e
        ? (e as { code: string }).code
        : null;
    if (message === "P2002") {
      return NextResponse.json(
        { error: "A client with this email already exists" },
        { status: 409 }
      );
    }
    console.error("PATCH /api/clients/[id]", e);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}
