import { NextRequest, NextResponse } from "next/server";
import { getClient, updateClient } from "@/lib/services/client.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const client = await getClient(id);
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
    const body = await request.json();
    const result = await updateClient(id, body);
    if (result.success) {
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  } catch (e) {
    console.error("PATCH /api/clients/[id]", e);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}
