import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/services/dashboard.service";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (e) {
    console.error("GET /api/dashboard", e);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
