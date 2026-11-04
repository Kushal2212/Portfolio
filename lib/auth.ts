import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await signSessionToken(payload);
  const store = await cookies();
  const headersList = await headers();
  // Cookies marked Secure are rejected over plain HTTP (for example when the
  // app is opened through a LAN IP). Trust the reverse proxy header when
  // present, otherwise fall back to the configured public site URL.
  const forwardedProto = headersList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const secure = forwardedProto
    ? forwardedProto === "https"
    : (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  try {
    return await prisma.user.findUnique({ where: { id: session.sub } });
  } catch {
    return null;
  }
}

/**
 * Verify the signed cookie *and* the underlying account. A token whose user
 * has been deleted, demoted or replaced no longer grants access.
 */
export async function getAdminUser() {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user || user.role !== "ADMIN") return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionPayload> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return {
    sub: user.id,
    email: user.email,
    name: user.name || "Admin",
    role: user.role,
  };
}
