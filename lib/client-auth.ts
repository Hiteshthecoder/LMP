"use client";

const DB_NAME = "LMP : Le monde parallel";
const STORE_NAME = "device";
const SESSION_STORE_NAME = "session";
const KEY = "identity";
const SESSION_KEY = "token";

type StoredDeviceIdentity = {
  deviceId: string;
  privateJwk: JsonWebKey;
  publicJwk: JsonWebKey;
};

type DeviceIdentity = {
  deviceId: string;
  privateKey: CryptoKey;
  publicJwk: JsonWebKey;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
      if (!request.result.objectStoreNames.contains(SESSION_STORE_NAME)) request.result.createObjectStore(SESSION_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function importPrivateKey(jwk: JsonWebKey) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"],
  );
}

export async function getDeviceIdentity(): Promise<DeviceIdentity> {
  const db = await openDb();
  const stored = await new Promise<any | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(KEY);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (stored?.deviceId && stored?.publicJwk) {
    try {
      const privateJwk = stored.privateJwk;
      if (privateJwk) {
        const privateKey = await importPrivateKey(privateJwk);
        db.close();
        return { deviceId: stored.deviceId, privateKey, publicJwk: stored.publicJwk };
      }

      // Backward compatibility for identities created by the previous version.
      if (stored.privateKey) {
        db.close();
        return { deviceId: stored.deviceId, privateKey: stored.privateKey, publicJwk: stored.publicJwk };
      }
    } catch {
      // Generate a fresh device identity below if the stored key cannot be imported.
    }
  }

  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  ) as CryptoKeyPair;

  const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const identity: StoredDeviceIdentity = {
    deviceId: crypto.randomUUID(),
    privateJwk,
    publicJwk,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(identity, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return { deviceId: identity.deviceId, privateKey: keyPair.privateKey, publicJwk };
}


export async function getStoredSessionToken(): Promise<string | null> {
  try {
    const db = await openDb();
    const token = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(SESSION_STORE_NAME, "readonly");
      const req = tx.objectStore(SESSION_STORE_NAME).get(SESSION_KEY);
      req.onsuccess = () => resolve(typeof req.result === "string" ? req.result : null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return token;
  } catch {
    return null;
  }
}

export async function storeSessionToken(token: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE_NAME, "readwrite");
    tx.objectStore(SESSION_STORE_NAME).put(token, SESSION_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function clearSessionToken() {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(SESSION_STORE_NAME, "readwrite");
      tx.objectStore(SESSION_STORE_NAME).delete(SESSION_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Nothing to clear.
  }
}

export async function signChallenge(challenge: string, privateKey: CryptoKey) {
  const bytes = new TextEncoder().encode(challenge);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    bytes,
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function clearDeviceIdentity() {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function hasDeviceIdentity() {
  try {
    const identity = await getDeviceIdentity();
    return Boolean(identity.deviceId);
  } catch {
    return false;
  }
}
