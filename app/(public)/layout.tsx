import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { getSettings } from "@/lib/settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <Navbar location={settings.hometown} name={settings.fullName} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
