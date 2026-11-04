import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsForm } from "@/components/admin/settings-form";
import { InterestsManager } from "@/components/admin/interests-manager";
import { PasswordForm } from "@/components/admin/password-form";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, interests] = await Promise.all([
    getSettings(),
    prisma.interest.findMany({ orderBy: { order: "asc" } }).catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Settings"
        description="Site content, interests and account security. Changes go live immediately."
      />

      <Tabs defaultValue="profile">
        <TabsList className="h-10">
          <TabsTrigger value="profile">Profile & SEO</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <SettingsForm settings={settings} />
        </TabsContent>

        <TabsContent value="interests">
          <InterestsManager
            interests={interests.map((interest) => ({
              id: interest.id,
              title: interest.title,
              description: interest.description,
              icon: interest.icon,
              order: interest.order,
            }))}
          />
        </TabsContent>

        <TabsContent value="security">
          <PasswordForm />
        </TabsContent>
      </Tabs>

      <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-[10px] leading-relaxed text-muted-foreground">
        Environment variables such as <code className="font-mono">DATABASE_URL</code>,{" "}
        <code className="font-mono">RESEND_API_KEY</code> and{" "}
        <code className="font-mono">AUTH_SECRET</code> live in{" "}
        <code className="font-mono">.env</code> and are never editable from the browser.
        See <code className="font-mono">.env.example</code> for the full list.
      </div>
    </div>
  );
}
