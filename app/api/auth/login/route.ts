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
    const usernameOrEmail = String(body.usernameOrEmail ?? "").trim();
    const password = String(body.password ?? "");
    const deviceId = String(body.deviceId ?? "");
    const publicJwk = body.publicJwk;

    if (!usernameOrEmail || password.length < 6 || !deviceId || !validatePublicJwk(publicJwk)) {
      return NextResponse.json({ error: "Invalid login data." }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail.toLowerCase() }],
    }).select("+passwordHash username displayName email role trustLevel");

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid username/email or password." }, { status: 401 });
    }

    await UserDevice.findOneAndUpdate(
      { deviceId },
      {
        userId: user._id,
        deviceId,
        publicJwk,
        deviceName: "Browser device",
        lastAuthenticatedAt: new Date(),
        revokedAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const token = await createSession(user._id.toString(), deviceId);
    return NextResponse.json({
      token,
      user: {
        _id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        trustLevel: user.trustLevel,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to log in right now." }, { status: 500 });
  }
}
