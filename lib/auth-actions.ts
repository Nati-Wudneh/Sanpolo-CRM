"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE } from "@/proxy";

export async function login(formData: FormData) {
  const password = formData.get("password")?.toString() ?? "";
  const next = formData.get("next")?.toString() || "/";
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword || password !== appPassword) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, appPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 days
  });
  redirect(next);
}

export async function logout() {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
  redirect("/login");
}
