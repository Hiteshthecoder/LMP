import { NextResponse } from "next/server";
import { revokeSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await revokeSession(request);
  return NextResponse.json({ ok: true });
}
