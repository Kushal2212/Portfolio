import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const settings = await getSettings();

  let unread = 0;
  try {
    unread = await prisma.message.count({ where: { status: "UNREAD" } });
  } catch {
    unread = 0;
  }

  return (
    <AdminShell
      name={session.name}
      email={session.email}
      avatar={settings.avatarUrl}
      unread={unread}
    >
      {children}
    </AdminShell>
  );
}
