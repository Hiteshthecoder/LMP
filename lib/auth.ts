import { createHash, createPublicKey, randomBytes, verify } from "node:crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import UserDevice from "@/models/UserDevice";
import Session from "@/models/Session";

export const SESSION_TTL_MS = 15 * 60 * 1000;

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function createSession(userId: string, deviceId: string) {
  await connectDB();
  const token = createSessionToken();
  await Session.create({
    userId,
    deviceId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
}

export function getBearerToken(request: Request) {
  const value = request.headers.get("authorization");
  if (!value?.startsWith("Bearer ")) return null;
  return value.slice(7).trim() || null;
}

export async function getSessionUser(request: Request) {
  await connectDB();
  const token = getBearerToken(request);
  if (!token) return null;

  const session = await Session.findOne({
    tokenHash: hashToken(token),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).lean() as { userId: string } | null;

  if (!session) return null;

  const user = await User.findById(session.userId).select("username displayName email role trustLevel balance").lean();
  if (!user) return null;

  return { user, session };
}

export async function revokeSession(request: Request) {
  await connectDB();
  const token = getBearerToken(request);
  if (!token) return;
  await Session.updateOne({ tokenHash: hashToken(token) }, { $set: { revokedAt: new Date() } });
}

export function validatePublicJwk(jwk: unknown): jwk is JsonWebKey {
  if (!jwk || typeof jwk !== "object") return false;
  const key = jwk as Record<string, unknown>;
  return key.kty === "EC" && key.crv === "P-256" && typeof key.x === "string" && typeof key.y === "string";
}

export function verifyDeviceSignature(publicJwk: JsonWebKey, challenge: string, signatureBase64Url: string) {
  try {
    const key = createPublicKey({ key: publicJwk as any, format: "jwk" });
    return verify(
      "sha256",
      Buffer.from(challenge, "utf8"),
      key,
      Buffer.from(signatureBase64Url, "base64url"),
    );
  } catch {
    return false;
  }
}
