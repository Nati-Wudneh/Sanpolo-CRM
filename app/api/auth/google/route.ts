import { NextRequest, NextResponse } from "next/server";
import { buildGoogleAuthUrl, isGoogleConfigured } from "@/lib/google";

export async function GET(req: NextRequest) {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(
      new URL("/settings?error=not_configured", req.url),
    );
  }
  const redirectUri = new URL("/api/auth/google/callback", req.url).toString();
  return NextResponse.redirect(buildGoogleAuthUrl(redirectUri));
}
