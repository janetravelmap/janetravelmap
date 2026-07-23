import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { sessions } from "../../../db/schema";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = readCookie(request.headers.get("cookie"), "jtm_session");
  if (token) await getDb().delete(sessions).where(eq(sessions.tokenHash, await sha256(token)));
  const returnTo = safeReturnTo(url.searchParams.get("return_to"));
  return new Response(null, {
    status: 302,
    headers: {
      location: new URL(returnTo, url.origin).toString(),
      "set-cookie": "jtm_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
      "cache-control": "no-store",
    },
  });
}

function readCookie(header: string | null, name: string) {
  for (const part of (header || "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

function safeReturnTo(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
