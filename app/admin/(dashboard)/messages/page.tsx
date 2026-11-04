import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/stat-card";
import { MessagesInbox } from "@/components/admin/messages-inbox";

export const metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.message
    .findMany({ orderBy: { createdAt: "desc" } })
    .catch(() => []);

  const unread = messages.filter((message) => message.status === "UNREAD").length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Messages"
        description={`${messages.length} enquiries · ${unread} unread · replies happen in your email client`}
      />
      <MessagesInbox
        messages={messages.map((message) => ({
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          phone: message.phone,
          body: message.body,
          status: message.status,
          createdAt: message.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
