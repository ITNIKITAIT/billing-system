import { NextResponse } from "next/server";
import { prisma } from "../../../prisma/db";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(plans);
  } catch (e) {
    console.error("GET /api/plans", e);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
