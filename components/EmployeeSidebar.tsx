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

const links = [
  { href: "/employee/dashboard", label: "Dashboard", index: "01" },
  { href: "/employee/attendance", label: "Attendance", index: "02" },
  { href: "/employee/schedule", label: "Schedule", index: "03" },
  { href: "/employee/tasks", label: "Tasks", index: "04" },
  { href: "/employee/performance", label: "Performance", index: "05" },
  { href: "/employee/exceptions", label: "Exceptions", index: "06" },
  { href: "/employee/notifications", label: "Notifications", index: "07" },
  { href: "/employee/profile", label: "Profile", index: "08" },
];

export function EmployeeSidebar() {
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
            <NotificationAccessButton href="/employee/notifications" variant="header" />
            <ChatAccessButton href="/employee/chat" variant="header" />
            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f1c2e] text-white" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </header>
        {open ? (
          <nav className="mt-3 rounded-3xl bg-[#0a0e1a]/95 p-5 text-white shadow-nav-dark">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} onMouseEnter={() => prefetch(link.href)} className="flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-xl font-display text-white/85">
                {link.label}
                <ArrowUpRight size={16} className="text-lime" />
              </Link>
            ))}
          </nav>
        ) : null}
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-64 flex-col overflow-hidden bg-navy-deep text-paper lg:flex">
        <div className="shrink-0 border-b border-paper/15 px-6 py-7">
          <BrandMark light />
          <p className="mt-4 font-mono-custom text-[9px] uppercase tracking-[0.22em] text-paper/45">Employee Portal</p>
          <p className="mt-2 text-sm text-paper/65">{user?.name || user?.email}</p>
        </div>
        <nav className="scrollbar-hidden min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-4">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => prefetch(link.href)}
                className={cn(
                  "flex min-h-11 items-center justify-between rounded-xl px-3 py-2 font-mono-custom text-[10px] uppercase tracking-[0.12em]",
                  active ? "bg-white/10 font-semibold text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
                )}
              >
                <span><span className="mr-2 text-white/40">{link.index}</span>{link.label}</span>
                {active ? <ArrowUpRight size={13} className="text-lime" /> : null}
              </Link>
            );
          })}
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
