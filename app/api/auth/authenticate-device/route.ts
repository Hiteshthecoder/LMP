import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { connectDB } from "@/lib/db";
import {
  createSession,
  validatePublicJwk,
  verifyDeviceSignature,
} from "@/lib/auth";
import UserDevice from "@/models/UserDevice";
import AuthChallenge from "@/models/AuthChallenge";
import User from "@/models/User";

export const runtime = "nodejs";

type DeviceRecord = {
  _id: unknown;
  userId: unknown;
  deviceId: string;
  publicJwk: unknown;
  revokedAt: Date | null;
};

type UserRecord = {
  _id: unknown;
  username: string;
  displayName: string;
  email: string;
  role: "user" | "admin";
  trustLevel: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const deviceId = String(body.deviceId ?? "");
    const challenge = String(body.challenge ?? "");
    const signature = String(body.signature ?? "");

    if (!deviceId || !challenge || !signature) {
      return NextResponse.json(
        { error: "Invalid authentication request." },
        { status: 400 },
      );
    }

    await connectDB();

    const device = (await UserDevice.findOne({
      deviceId,
      revokedAt: null,
    }).lean()) as DeviceRecord | null;

    if (!device) {
      return NextResponse.json(
        { error: "Device is not registered." },
        { status: 404 },
      );
    }

    const challengeHash = createHash("sha256")
      .update(challenge)
      .digest("hex");

    const record = await AuthChallenge.findOneAndDelete({
      deviceId,
      challengeHash,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!record) {
      return NextResponse.json(
        { error: "Challenge expired or already used." },
        { status: 401 },
      );
    }

    if (!validatePublicJwk(device.publicJwk)) {
      return NextResponse.json(
        { error: "Registered device key is invalid." },
        { status: 401 },
      );
    }

    if (
      !verifyDeviceSignature(
        device.publicJwk,
        challenge,
        signature,
      )
    ) {
      return NextResponse.json(
        { error: "Device authentication failed." },
        { status: 401 },
      );
    }

    await UserDevice.updateOne(
      { _id: device._id },
      { $set: { lastAuthenticatedAt: new Date() } },
    );

    const user = (await User.findById(device.userId)
      .select("username displayName email role trustLevel")
      .lean()) as UserRecord | null;

    if (!user) {
      return NextResponse.json(
        { error: "User no longer exists." },
        { status: 404 },
      );
    }

    const userId = String(user._id);
    const token = await createSession(userId, deviceId);

    return NextResponse.json({
      token,
      user: {
        _id: userId,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        trustLevel: user.trustLevel,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to authenticate this device." },
      { status: 500 },
    );
  }
}