import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "kd_session";
export const SESSION_DAYS = 7;

const ISSUER = "kushal-portfolio";
const AUDIENCE = "kushal-portfolio-admin";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a random value of at least 32 characters before starting the app.",
    );
  }
  return new TextEncoder().encode(value);
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
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
