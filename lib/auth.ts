// HMAC-signed session token, verifiable in both the Edge middleware and the
// Node API route via the Web Crypto API. Token format: `${expMs}.${sigB64url}`.

export const SESSION_COOKIE = "aa_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const encoder = new TextEncoder();

function b64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return b64url(sig);
}

/** Create a token that expires `SESSION_TTL_MS` from now. */
export async function createSessionToken(secret: string): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = await hmac(secret, String(exp));
  return `${exp}.${sig}`;
}

/** Validate signature and expiry. Returns false on anything suspicious. */
export async function verifySessionToken(
  secret: string,
  token: string | undefined,
): Promise<boolean> {
  if (!secret || !token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = await hmac(secret, expStr);
  // constant-time-ish compare
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}
