const AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

declare global {
  var __GOOGLE_CLIENT_ID__: string | undefined;
}

export async function GET(request: Request) {
  const clientId = globalThis.__GOOGLE_CLIENT_ID__;
  if (!clientId) return new Response("Google 登入尚未設定完成", { status: 503 });

  const requestUrl = new URL(request.url);
  const returnTo = safeReturnTo(requestUrl.searchParams.get("return_to"));
  const state = randomToken();
  const callback = new URL("/auth/google/callback", requestUrl.origin).toString();
  const authorize = new URL(AUTHORIZATION_ENDPOINT);
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", callback);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "openid email profile");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("prompt", "select_account");

  const headers = new Headers({ location: authorize.toString(), "cache-control": "no-store" });
  headers.append("set-cookie", cookie("jtm_oauth_state", state, 600));
  headers.append("set-cookie", cookie("jtm_return_to", returnTo, 600));
  return new Response(null, { status: 302, headers });
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64Url(bytes);
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function safeReturnTo(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}
