import { NextRequest, NextResponse } from "next/server";
import { completeGoogleConnection } from "@/lib/google";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(error)}`, req.url),
    );
  }
  if (!code) {
    return NextResponse.redirect(new URL("/settings?error=missing_code", req.url));
  }

  const redirectUri = new URL("/api/auth/google/callback", req.url).toString();

  try {
    await completeGoogleConnection(code, redirectUri);
    return NextResponse.redirect(new URL("/settings?connected=1", req.url));
  } catch (err) {
    return NextResponse.redirect(
      new URL(
        `/settings?error=${encodeURIComponent(err instanceof Error ? err.message : "unknown")}`,
        req.url,
      ),
    );
  }
}
