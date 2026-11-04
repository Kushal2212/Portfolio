"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronLeft,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Music2,
  PanelLeftClose,
  Plus,
  Settings,
  Users,
  ExternalLink,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/actions/auth";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, group: "Workspace" },
  { href: "/admin/blog", label: "Blog posts", icon: FileText, group: "Content" },
  { href: "/admin/music", label: "Music", icon: Music2, group: "Content" },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: MessageSquareQuote,
    group: "Content",
  },
  { href: "/admin/media", label: "Photos & media", icon: Images, group: "Content" },
  { href: "/admin/visitors", label: "Visitors", icon: Users, group: "Audience" },
  { href: "/admin/messages", label: "Messages", icon: Mail, group: "Audience" },
  { href: "/admin/settings", label: "Settings", icon: Settings, group: "System" },
];

const COLLAPSE_KEY = "kd-admin-collapsed";

function subscribeCollapsed(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("kd-admin-collapsed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("kd-admin-collapsed", callback);
  };
}

function NavList({
  collapsed,
  unread,
  onNavigate,
}: {
  collapsed?: boolean;
  unread: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const groups = [...new Set(nav.map((item) => item.group))];

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
      {groups.map((group) => (
        <div key={group}>
          {!collapsed && (
            <p className="mb-1.5 px-2.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              {group}
            </p>
          )}
          <div className="space-y-0.5">
            {nav
              .filter((item) => item.group === group)
              .map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                      collapsed && "justify-center px-2",
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {item.href === "/admin/messages" && unread > 0 && (
                      <span
                        className={cn(
                          "ml-auto flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                          collapsed && "absolute -right-0.5 -top-0.5 ml-0 min-w-4 px-1",
                          active ? "bg-background/20 text-background" : "bg-brand-strong text-brand-foreground",
                        )}
                      >
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="border-t border-border p-3">
      <Link
        href="/"
        target="_blank"
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          collapsed && "justify-center px-2",
        )}
        title="View live site"
      >
        <ExternalLink className="size-4" />
        {!collapsed && (
          <>
            <span>View live site</span>
            <ArrowUpRight className="ml-auto size-3" />
          </>
        )}
      </Link>
    </div>
  );
}

export function AdminShell({
  children,
  name,
  email,
  avatar,
  unread,
}: {
  children: React.ReactNode;
  name: string;
  email: string;
  avatar?: string;
  unread: number;
}) {
  const collapsed = React.useSyncExternalStore(
    subscribeCollapsed,
    () => localStorage.getItem(COLLAPSE_KEY) === "1",
    () => false,
  );
  const pathname = usePathname();

  function toggleCollapsed() {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "0" : "1");
    window.dispatchEvent(new Event("kd-admin-collapsed"));
  }

  const pageTitle =
    nav.find((item) => (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)))
      ?.label ?? "Admin";

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card/50 transition-[width] duration-300 md:flex",
          collapsed ? "w-[76px]" : "w-[248px]",
        )}
      >
        <div className={cn("flex h-16 items-center gap-2.5 border-b border-border px-4", collapsed && "justify-center px-2")}>
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <span className="font-serif text-sm italic">kd</span>
            </span>
            {!collapsed && (
              <span className="leading-none">
                <span className="block text-[13px] font-semibold tracking-tight">Kushal Dahal</span>
                <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
                  admin panel
                </span>
              </span>
            )}
          </Link>
        </div>

        <NavList collapsed={collapsed} unread={unread} />
        <SidebarFooter collapsed={collapsed} />

        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-20 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("size-3 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open admin menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <SheetHeader className="border-b border-border p-5">
                <SheetTitle className="font-serif text-xl italic">Admin</SheetTitle>
              </SheetHeader>
              <NavList unread={unread} />
              <SidebarFooter />
            </SheetContent>
          </Sheet>

          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span>Admin</span>
            <span className="text-border">/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button asChild variant="outline" size="sm" className="hidden rounded-full sm:inline-flex">
              <Link href="/admin/blog/new">
                <Plus className="size-3.5" /> New post
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" className="rounded-full">
              <Link href="/" target="_blank" aria-label="View site">
                <ExternalLink className="size-4" />
              </Link>
            </Button>
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2 rounded-full border border-border p-0.5 pr-2 transition-colors hover:bg-muted">
                  {avatar ? (
                    <span className="relative size-7 overflow-hidden rounded-full">
                      <Image src={avatar} alt={name} fill sizes="28px" className="object-cover" />
                    </span>
                  ) : (
                    <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                      {initials(name)}
                    </span>
                  )}
                  <span className="hidden max-w-24 truncate text-[11px] font-medium sm:block">{name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
                <div className="px-2.5 pb-2">
                  <p className="truncate text-xs font-medium">{name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" target="_blank">
                    <PanelLeftClose /> View portfolio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={logoutAction}>
                  <DropdownMenuItem asChild>
                    <button type="submit" className="w-full text-destructive focus:text-destructive">
                      <LogOut /> Sign out
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
