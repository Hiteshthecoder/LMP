import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { createSession, validatePublicJwk } from "@/lib/auth";
import User from "@/models/User";
import UserDevice from "@/models/UserDevice";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const displayName = String(body.displayName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const deviceId = String(body.deviceId ?? "");
    const publicJwk = body.publicJwk;

    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      return NextResponse.json({ error: "Username must be 3-32 characters using letters, numbers, or _." }, { status: 400 });
    }
    if (!displayName || displayName.length > 80 || !email.includes("@") || password.length < 8) {
      return NextResponse.json({ error: "Please provide a valid name, email, and password of at least 8 characters." }, { status: 400 });
    }
    if (!deviceId || !validatePublicJwk(publicJwk)) {
      return NextResponse.json({ error: "Invalid device registration." }, { status: 400 });
    }

    await connectDB();

    // username and email are unique indexes. Avoid a read-before-write query
    // and handle the duplicate-key race at the write itself.
    const passwordHash = await bcrypt.hash(password, 12);
    let user;
    try {
      user = await User.create({ username, displayName, email, passwordHash });
    } catch (error: any) {
      if (error?.code === 11000) {
        return NextResponse.json(
          { error: "Username or email is already registered." },
          { status: 409 },
        );
      }
      throw error;
    }

    await UserDevice.findOneAndUpdate(
      { deviceId },
      { userId: user._id, deviceId, publicJwk, deviceName: "Browser device", lastAuthenticatedAt: new Date(), revokedAt: null },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const token = await createSession(user._id.toString(), deviceId);
    return NextResponse.json({
      token,
      user: { _id: user._id.toString(), username, displayName, email, role: user.role, trustLevel: user.trustLevel },
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to register right now." }, { status: 500 });
  }
}
