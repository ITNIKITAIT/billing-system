import { NextResponse } from "next/server";
import { getPlans } from "@/lib/services/plan.service";

export async function GET() {
  try {
    const plans = await getPlans();
    return NextResponse.json(plans);
  } catch (e) {
    console.error("GET /api/plans", e);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
