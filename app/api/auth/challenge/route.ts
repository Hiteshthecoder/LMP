import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { connectDB } from "@/lib/db";
import UserDevice from "@/models/UserDevice";
import AuthChallenge from "@/models/AuthChallenge";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get("deviceId")?.trim();
  if (!deviceId) return NextResponse.json({ error: "Missing device ID." }, { status: 400 });

  await connectDB();
  const device = await UserDevice.findOne({ deviceId, revokedAt: null }).lean();
  if (!device) return NextResponse.json({ error: "Unknown device." }, { status: 404 });

  const challenge = randomBytes(32).toString("base64url");
  const challengeHash = createHash("sha256").update(challenge).digest("hex");
  await AuthChallenge.create({ deviceId, challengeHash, expiresAt: new Date(Date.now() + 2 * 60 * 1000) });

  return NextResponse.json({ challenge });
}
