"use client";

import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ChatAccessButton } from "@/components/ChatAccessButton";
import { NotificationAccessButton } from "@/components/NotificationAccessButton";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";

const workforceLinks = [
  { href: "/admin/dashboard", label: "Overview", index: "01" },
  { href: "/admin/employees", label: "Employees", index: "02" },
  { href: "/admin/departments", label: "Departments", index: "02b" },
  { href: "/admin/attendance", label: "Attendance", index: "03" },
  { href: "/admin/schedules", label: "Schedules", index: "04" },
  { href: "/admin/tasks", label: "Tasks", index: "05" },
  { href: "/admin/exceptions", label: "Exceptions", index: "06" },
  { href: "/admin/reports", label: "Reports", index: "07" },
  { href: "/admin/evaluations", label: "Evaluations", index: "08" },
  { href: "/admin/settings", label: "Settings", index: "09" },
  { href: "/admin/audit", label: "Audit Log", index: "10" },
];

const salesLinks = [
  { href: "/admin/sales", label: "Sales Dashboard", index: "S1" },
  { href: "/admin/sales/leads", label: "Leads", index: "S2" },
  { href: "/admin/sales/pipeline", label: "Pipeline", index: "S3" },
  { href: "/admin/sales/activity", label: "Activity", index: "S4" },
  { href: "/admin/sales/analytics", label: "Analytics", index: "S5" },
  { href: "/admin/sales/settings", label: "Sync Settings", index: "S6" },
];

function NavSection({
  title,
  links,
  pathname,
  prefetch,
}: {
  title: string;
  links: typeof workforceLinks;
  pathname: string;
  prefetch: (href: string) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-2 font-mono-custom text-[9px] uppercase tracking-[0.2em] text-white/40">{title}</p>
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            onMouseEnter={() => prefetch(link.href)}
            className={cn(
              "flex min-h-10 items-center justify-between rounded-xl px-3 py-2 font-mono-custom text-[10px] uppercase tracking-[0.12em] transition-colors",
              active ? "bg-white/10 font-semibold text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
            )}
          >
            <span><span className="mr-2 text-white/40">{link.index}</span>{link.label}</span>
            {active ? <ArrowUpRight size={13} className="text-lime" /> : null}
          </Link>
        );
      })}
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  const prefetch = (href: string) => {
    router.prefetch(href);
    api.prefetchRoute(href);
  };

  return (
    <>
      <div className="sticky top-0 z-40 px-4 pt-4 lg:hidden">
        <header className="flex items-center justify-between rounded-full border border-[#0f1c2e]/12 bg-white/85 px-4 py-2 shadow-nav backdrop-blur-2xl">
          <BrandMark />
          <div className="flex items-center gap-2">
            <NotificationAccessButton href="/admin/notifications" variant="header" />
            <ChatAccessButton href="/admin/chat" variant="header" />
            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f1c2e] text-white" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </header>
        {open ? (
          <nav className="mt-3 space-y-4 rounded-3xl bg-[#0a0e1a]/95 p-5 text-white shadow-nav-dark">
            <NavSection title="Workforce" links={workforceLinks} pathname={pathname} prefetch={prefetch} />
            <NavSection title="Sales" links={salesLinks} pathname={pathname} prefetch={prefetch} />
          </nav>
        ) : null}
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-72 flex-col overflow-hidden bg-navy-deep text-paper lg:flex">
        <div className="shrink-0 border-b border-paper/15 px-6 py-7">
          <BrandMark light />
          <p className="mt-4 font-mono-custom text-[9px] uppercase tracking-[0.22em] text-paper/45">Admin Portal</p>
          <p className="mt-2 text-sm text-paper/65">{user?.email}</p>
        </div>
        <nav className="scrollbar-hidden min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-4">
          <NavSection title="Workforce" links={workforceLinks} pathname={pathname} prefetch={prefetch} />
          <NavSection title="Sales" links={salesLinks} pathname={pathname} prefetch={prefetch} />
        </nav>
        <div className="shrink-0 border-t border-paper/15 p-4">
          <button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-paper/75 hover:bg-white/5 hover:text-white">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
