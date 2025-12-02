import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  // For now we just echo the payload back with a mock id.
  const id = `api-mock-${Math.random().toString(36).slice(2, 10)}`;

  return NextResponse.json(
    {
      status: "success",
      id,
      received: body ?? null,
    },
    { status: 200 },
  );
}


