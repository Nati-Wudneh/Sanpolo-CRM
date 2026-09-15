import { deleteSetting, getSetting, setSetting } from "@/lib/settings";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export function isGoogleConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function buildGoogleAuthUrl(redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES,
    access_type: "offline",
    prompt: "consent",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as TokenResponse;
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as Omit<TokenResponse, "refresh_token">;
}

export async function completeGoogleConnection(code: string, redirectUri: string) {
  const tokens = await exchangeCodeForTokens(code, redirectUri);
  if (!tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh token — disconnect any prior authorization for this app at https://myaccount.google.com/permissions and try connecting again.",
    );
  }
  const expiresAt = Date.now() + tokens.expires_in * 1000;
  setSetting("google_access_token", tokens.access_token);
  setSetting("google_refresh_token", tokens.refresh_token);
  setSetting("google_token_expiry", String(expiresAt));

  const profileRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (profileRes.ok) {
    const profile = (await profileRes.json()) as { email?: string };
    if (profile.email) setSetting("google_email", profile.email);
  }
}

export function isGmailConnected() {
  return !!getSetting("google_refresh_token");
}

export function getConnectedGmailAddress() {
  return getSetting("google_email");
}

export function disconnectGmail() {
  deleteSetting("google_access_token");
  deleteSetting("google_refresh_token");
  deleteSetting("google_token_expiry");
  deleteSetting("google_email");
}

/** Returns a valid access token, refreshing it first if it's expired or about to expire. */
export async function getValidAccessToken(): Promise<string | null> {
  const refreshToken = getSetting("google_refresh_token");
  if (!refreshToken) return null;

  const expiry = Number(getSetting("google_token_expiry") ?? 0);
  const accessToken = getSetting("google_access_token");
  if (accessToken && expiry - Date.now() > 60_000) {
    return accessToken;
  }

  const refreshed = await refreshAccessToken(refreshToken);
  const expiresAt = Date.now() + refreshed.expires_in * 1000;
  setSetting("google_access_token", refreshed.access_token);
  setSetting("google_token_expiry", String(expiresAt));
  return refreshed.access_token;
}
