import { NextRequest, NextResponse } from "next/server";

export const AUTH_COOKIE = "crm_auth";

const PUBLIC_PATHS = ["/login", "/favicon.ico", "/api/health"];

export function proxy(req: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;

  // No password configured — leave the site open (e.g. local development).
  if (!appPassword) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie === appPassword) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match everything except Next.js internals and static files, so the
     * gate covers pages and API routes alike.
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
