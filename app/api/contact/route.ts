import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendContactEmail } from "@/lib/mail";

export const runtime = "nodejs";

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);
    if (ip !== "unknown") form.append("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`contact:${ip}`, 4, 10 * 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "You've sent a few messages already. Please try again in a little while." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = payload as Record<string, unknown>;

  // Honeypot filled → pretend success, store nothing. Checked before validation
  // so bots get no feedback about which field gave them away.
  if (typeof raw.company === "string" && raw.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ error: "Please check the form.", fieldErrors }, { status: 400 });
  }

  const data = parsed.data;

  const turnstileOk = await verifyTurnstile(
    typeof raw.turnstileToken === "string" ? raw.turnstileToken : undefined,
    ip,
  );
  if (!turnstileOk) {
    return NextResponse.json({ error: "Spam check failed. Please refresh and try again." }, { status: 400 });
  }

  try {
    const message = await prisma.message.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        subject: data.subject || "General enquiry",
        phone: data.phone || null,
        body: data.message,
      },
    });

    await sendContactEmail({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });

    return NextResponse.json({ ok: true, id: message.id });
  } catch (error) {
    console.error("contact failed", error);
    return NextResponse.json(
      { error: "Something went wrong saving your message. Please email me directly." },
      { status: 500 },
    );
  }
}
