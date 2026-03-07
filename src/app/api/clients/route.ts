import { NextRequest, NextResponse } from "next/server";
import { createClient, getClients } from "@/lib/services/client.service";

export async function GET() {
  try {
    const clients = await getClients();
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
    const result = await createClient(body);
    if (result.success) {
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  } catch (e) {
    console.error("POST /api/clients", e);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
