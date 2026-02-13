import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Use /api/protected-image/{path} instead." },
    { status: 410 }
  );
}
