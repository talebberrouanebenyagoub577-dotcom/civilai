"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  Building2,
  FolderOpen,
  HardDrive,
  History,
  LayoutDashboard,
  Menu,
  PlusCircle,
  X,
} from "lucide-react";
import { useState } from "react";
import { APP_NAME } from "@/constants/engineering";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/study", label: "AI Engineering Study", icon: BrainCircuit },
  { href: "/projects/new", label: "New Project", icon: PlusCircle },
  { href: "/projects", label: "Project History", icon: History },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-blue-800/30 px-6 py-5">
        <div className="rounded-lg bg-white/10 p-2">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">{APP_NAME}</p>
          <p className="text-xs text-blue-200">Engineering Assistant</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/15 text-white"
                  : "text-blue-100 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-blue-800/30 p-4">
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="flex items-center gap-2 text-blue-200">
            <HardDrive className="h-4 w-4" />
            <p className="text-xs font-medium">Local Storage</p>
          </div>
          <p className="mt-1 text-xs text-blue-300">Projects saved in your browser</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 bg-gradient-to-b from-blue-900 to-blue-800 lg:block">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-800">
            <button
              className="absolute right-3 top-3 rounded-lg p-2 text-white hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-slate-600 lg:hidden">
              <Building2 className="h-5 w-5 text-blue-700" />
              <span className="font-semibold text-slate-900">{APP_NAME}</span>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex">
            <FolderOpen className="h-4 w-4" />
            Civil Engineering Preliminary Studies
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
