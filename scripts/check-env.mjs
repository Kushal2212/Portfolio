#!/usr/bin/env node
/**
 * Pre-build environment check.
 *
 * Fails fast with an actionable message instead of letting a deployment boot
 * with missing secrets or placeholder values. Set SKIP_ENV_VALIDATION=1 only
 * when you know exactly what you are doing (for example a throwaway preview).
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Next.js loads .env when the build starts, but this script runs before that.
// Read it here while letting real process environment variables win (hosting
// platforms inject those directly).
const envFile = resolve(process.cwd(), ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(match[1] in process.env)) process.env[match[1]] = value;
  }
}

const problems = [];
const warnings = [];

function fail(message) {
  problems.push(message);
}

function warn(message) {
  warnings.push(message);
}

function env(name) {
  return (process.env[name] || "").trim();
}

const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

const skip = ["1", "true", "yes"].includes(env("SKIP_ENV_VALIDATION").toLowerCase());

if (!skip) {
  const databaseUrl = env("DATABASE_URL");
  if (!databaseUrl) {
    fail("DATABASE_URL is required (MongoDB connection string).");
  } else if (!/^mongodb(\+srv)?:\/\//.test(databaseUrl)) {
    fail("DATABASE_URL must start with mongodb:// or mongodb+srv://.");
  }

  const authSecret = env("AUTH_SECRET");
  const insecureSecrets = new Set([
    "dev-only-insecure-secret-change-me",
    "replace-me-with-a-long-random-string",
    "secret",
    "changeme",
  ]);
  if (!authSecret) {
    fail("AUTH_SECRET is required. Generate one with: openssl rand -base64 48");
  } else if (authSecret.length < 32) {
    fail("AUTH_SECRET must be at least 32 characters. Generate a new one with: openssl rand -base64 48");
  } else if (insecureSecrets.has(authSecret)) {
    fail("AUTH_SECRET is still set to a placeholder value. Replace it with a random secret.");
  }

  const siteUrl = env("NEXT_PUBLIC_SITE_URL");
  if (!siteUrl) {
    fail("NEXT_PUBLIC_SITE_URL is required (the canonical public URL of the site).");
  } else {
    try {
      const parsed = new URL(siteUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        fail("NEXT_PUBLIC_SITE_URL must be an http(s) URL.");
      }
      if (isProduction && parsed.protocol !== "https:") {
        fail("NEXT_PUBLIC_SITE_URL must use https in production.");
      }
      if (
        isProduction &&
        ["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname)
      ) {
        fail("NEXT_PUBLIC_SITE_URL cannot point at localhost in production.");
      }
    } catch {
      fail("NEXT_PUBLIC_SITE_URL is not a valid URL.");
    }
  }

  const adminEmail = env("ADMIN_EMAIL");
  const adminPassword = env("ADMIN_PASSWORD");

  if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    fail("ADMIN_EMAIL must be a valid email address.");
  }

  if (isProduction) {
    if (!adminEmail) {
      fail("ADMIN_EMAIL is required in production so the owner account can be bootstrapped.");
    }
    if (!adminPassword) {
      fail("ADMIN_PASSWORD is required in production for the first-run owner account.");
    } else if (adminPassword.length < 12) {
      fail("ADMIN_PASSWORD must be at least 12 characters in production.");
    } else if (
      ["admin1234", "password", "changeme", "letmein"].includes(
        adminPassword.toLowerCase(),
      )
    ) {
      fail("ADMIN_PASSWORD is a well-known weak password. Choose a unique one.");
    }
  } else if (adminPassword && adminPassword.length < 12) {
    warn("ADMIN_PASSWORD is short. Production builds require at least 12 characters.");
  }

  const cloudinary = {
    CLOUDINARY_CLOUD_NAME: env("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: env("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: env("CLOUDINARY_API_SECRET"),
  };
  const cloudinarySet = Object.values(cloudinary).filter(Boolean).length;
  if (cloudinarySet > 0 && cloudinarySet < 3) {
    fail("Cloudinary is partially configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET together.");
  }

  const turnstileSecret = env("TURNSTILE_SECRET_KEY");
  const turnstileSiteKey = env("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
  if (Boolean(turnstileSecret) !== Boolean(turnstileSiteKey)) {
    fail("Turnstile requires both TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY, or neither.");
  }

  if (env("RESEND_API_KEY") && !env("RESEND_FROM_EMAIL")) {
    warn("RESEND_FROM_EMAIL is not set. Contact emails will fall back to Resend's onboarding sender.");
  }
}

for (const message of warnings) {
  console.warn(`⚠️  env: ${message}`);
}

if (problems.length > 0) {
  console.error("\n✖ Environment validation failed:\n");
  for (const message of problems) console.error(`  • ${message}`);
  console.error("\nFix the values in .env (or your hosting provider) and try again.");
  console.error("Set SKIP_ENV_VALIDATION=1 to bypass this check at your own risk.\n");
  process.exit(1);
}

console.log("✓ Environment looks good.");
