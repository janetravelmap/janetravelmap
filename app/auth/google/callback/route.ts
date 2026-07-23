import { getDb } from "../../../../db";
import { sessions } from "../../../../db/schema";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

declare global {
  var __GOOGLE_CLIENT_ID__: string | undefined;
  var __GOOGLE_CLIENT_SECRET__: string | undefined;
}

type TokenResponse = { access_token?: string };
type UserInfo = { email?: string; email_verified?: boolean; name?: string };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookies = parseCookies(request.headers.get("cookie"));
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (!state || !code || state !== cookies.jtm_oauth_state) {
    return redirectWithMessage(url.origin, "登入驗證已過期，請重新登入");
  }

  const clientId = globalThis.__GOOGLE_CLIENT_ID__;
  const clientSecret = globalThis.__GOOGLE_CLIENT_SECRET__;
  if (!clientId || !clientSecret) return new Response("Google 登入尚未設定完成", { status: 503 });

  const redirectUri = new URL("/auth/google/callback", url.origin).toString();
  const tokenResponse = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenResponse.ok) return redirectWithMessage(url.origin, "Google 登入失敗，請再試一次");
  const token = await tokenResponse.json() as TokenResponse;
  if (!token.access_token) return redirectWithMessage(url.origin, "Google 登入失敗，請再試一次");

  const userResponse = await fetch(USERINFO_ENDPOINT, {
    headers: { authorization: `Bearer ${token.access_token}` },
  });
  if (!userResponse.ok) return redirectWithMessage(url.origin, "無法取得 Google 帳戶資料");
  const user = await userResponse.json() as UserInfo;
  if (!user.email || user.email_verified !== true) {
    return redirectWithMessage(url.origin, "Google 電子郵件尚未完成驗證");
  }

  const sessionToken = randomToken();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_SECONDS * 1000);
  await getDb().insert(sessions).values({
    tokenHash: await sha256(sessionToken),
    ownerEmail: user.email.toLowerCase(),
    fullName: user.name?.trim() || null,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  });

  const returnTo = safeReturnTo(cookies.jtm_return_to);
  const headers = new Headers({ location: new URL(returnTo, url.origin).toString(), "cache-control": "no-store" });
  headers.append("set-cookie", cookie("jtm_session", sessionToken, SESSION_SECONDS));
  headers.append("set-cookie", clearCookie("jtm_oauth_state"));
  headers.append("set-cookie", clearCookie("jtm_return_to"));
  return new Response(null, { status: 302, headers });
}

function redirectWithMessage(origin: string, message: string) {
  const target = new URL("/", origin);
  target.searchParams.set("login_error", message);
  return Response.redirect(target, 302);
}

function parseCookies(header: string | null) {
  const values: Record<string, string> = {};
  for (const part of (header || "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key) values[key] = decodeURIComponent(value.join("="));
  }
  return values;
}

function safeReturnTo(value: string | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookie(name: string) {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
