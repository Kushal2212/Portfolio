"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { loginSchema, passwordSchema } from "@/lib/validators";
import { clearRateLimit, getClientIp, rateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") || "").toLowerCase().trim(),
    password: String(formData.get("password") || ""),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const ip = getClientIp(await headers());
  const byIp = rateLimit(`login:ip:${ip}`, 8, 15 * 60_000);
  const byEmail = rateLimit(`login:email:${parsed.data.email}`, 5, 15 * 60_000);
  if (!byIp.success || !byEmail.success) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  try {
    let user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

    // First-run bootstrap: create the owner account from env credentials.
    // No fallback credentials exist; both values must be configured.
    if (!user) {
      const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD || "";
      const isProduction = process.env.NODE_ENV === "production";
      const credentialsUsable =
        adminEmail.length > 0 &&
        adminPassword.length > 0 &&
        (!isProduction || adminPassword.length >= 12);

      if (credentialsUsable) {
        const anyUser = await prisma.user.count();
        if (
          anyUser === 0 &&
          parsed.data.email === adminEmail &&
          parsed.data.password === adminPassword
        ) {
          user = await prisma.user.create({
            data: {
              email: adminEmail,
              passwordHash: await hashPassword(adminPassword),
              name: "Kushal Dahal",
              role: "ADMIN",
            },
          });
        }
      }
    }

    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return { error: "That email and password combination doesn't match." };
    }

    clearRateLimit(`login:ip:${ip}`);
    clearRateLimit(`login:email:${parsed.data.email}`);

    await createSession({
      sub: user.id,
      email: user.email,
      name: user.name || "Admin",
      role: user.role,
    });

    revalidatePath("/admin");
  } catch (error) {
    console.error("login failed", error);
    return { error: "Could not sign in right now. Check the database connection." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(
  _prev: { error?: string; success?: string },
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const session = await requireAdmin();
  const parsed = passwordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") || ""),
    newPassword: String(formData.get("newPassword") || ""),
    confirmPassword: String(formData.get("confirmPassword") || ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Check the password fields." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) return { error: "Account not found." };

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return { error: "Your current password is incorrect." };

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(parsed.data.newPassword) },
    });

    return { success: "Password updated. Use it the next time you sign in." };
  } catch (error) {
    console.error("password change failed", error);
    return { error: "Could not update the password. Please try again." };
  }
}
