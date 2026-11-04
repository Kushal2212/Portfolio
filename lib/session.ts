import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "kd_session";
export const SESSION_DAYS = 7;

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me",
  );
}

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
};

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
