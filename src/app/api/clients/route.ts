import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../prisma/db";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: { plan: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(clients);
  } catch (e) {
    console.error("GET /api/clients", e);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, planId, discount, subscriptionStartDate } = body;

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "name is required and must be a non-empty string" },
        { status: 400 }
      );
    }
    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "email is required and must be a non-empty string" },
        { status: 400 }
      );
    }
    if (typeof planId !== "string" || !planId.trim()) {
      return NextResponse.json(
        { error: "planId is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const discountNum = discount != null ? Number(discount) : 0;
    if (Number.isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      return NextResponse.json(
        { error: "discount must be a number between 0 and 100" },
        { status: 400 }
      );
    }

    const startDate =
      subscriptionStartDate != null && subscriptionStartDate !== ""
        ? new Date(subscriptionStartDate)
        : null;
    if (
      startDate !== null &&
      (Number.isNaN(startDate.getTime()) || startDate.getTime() < 0)
    ) {
      return NextResponse.json(
        { error: "subscriptionStartDate must be a valid date or omitted" },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        planId,
        discount: discountNum,
        subscriptionStartDate: startDate,
      },
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
    console.error("POST /api/clients", e);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
