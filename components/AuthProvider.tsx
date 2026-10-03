"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearDeviceIdentity, clearSessionToken, getDeviceIdentity, getStoredSessionToken, signChallenge, storeSessionToken } from "@/lib/client-auth";

type User = {
  _id?: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  trustLevel: number;
  balance: number;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<string | null>;
  register: (input: { username: string; displayName: string; email: string; password: string }) => Promise<string | null>;
  logout: () => Promise<void>;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseError(response: Response) {
  try {
    const data = await response.json();
    return data.error || "Request failed";
  } catch {
    return "Request failed";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const authenticateDevice = useCallback(async () => {
    const identity = await getDeviceIdentity();

    // First restore the session token from IndexedDB. This survives a full
    // page refresh without using cookies, localStorage, or sessionStorage.
    const storedToken = await getStoredSessionToken();
    if (storedToken) {
      const sessionResponse = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
        cache: "no-store",
      });
      if (sessionResponse.ok) {
        const data = await sessionResponse.json();
        setToken(storedToken);
        setUser(data.user);
        return true;
      }

      // The stored session may have expired. Remove only the session token;
      // keep the device identity so it can silently authenticate again.
      await clearSessionToken();
    }

    const challengeResponse = await fetch(`/api/auth/challenge?deviceId=${encodeURIComponent(identity.deviceId)}`, {
      cache: "no-store",
    });
    if (!challengeResponse.ok) return false;

    const { challenge } = await challengeResponse.json();
    const signature = await signChallenge(challenge, identity.privateKey);
    const response = await fetch("/api/auth/authenticate-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId: identity.deviceId, challenge, signature }),
      cache: "no-store",
    });
    if (!response.ok) return false;

    const data = await response.json();
    await storeSessionToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await authenticateDevice();
      } catch {
        // No registered device yet; user will see login/register.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authenticateDevice]);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const identity = await getDeviceIdentity();
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password, deviceId: identity.deviceId, publicJwk: identity.publicJwk }),
    });
    if (!response.ok) return parseError(response);
    const data = await response.json();
    await storeSessionToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return null;
  }, []);

  const register = useCallback(async (input: { username: string; displayName: string; email: string; password: string }) => {
    const identity = await getDeviceIdentity();
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, deviceId: identity.deviceId, publicJwk: identity.publicJwk }),
    });
    if (!response.ok) return parseError(response);
    const data = await response.json();
    await storeSessionToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return null;
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined);
    }
    setToken(null);
    setUser(null);
    await clearSessionToken();
    await clearDeviceIdentity().catch(() => undefined);
  }, [token]);

  const authFetch = useCallback(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    let response = await fetch(input, { ...init, headers });
    return response;
  }, [token, authenticateDevice]);

  const value = useMemo(() => ({ user, loading, login, register, logout, authFetch }), [user, loading, login, register, logout, authFetch]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
