"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Dumbbell, LayoutDashboard, Menu, QrCode, User } from "lucide-react";
import { PortalSidebar } from "@/components/shared/PortalSidebar";
import { NotificationCenter } from "@/components/shared/NotificationCenter";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MOBILE_TABS = [
  { label: "Resumen", icon: LayoutDashboard, href: "/portal" },
  { label: "QR", icon: QrCode, href: "/portal/qr" },
  { label: "Clases", icon: Calendar, href: "/portal/classes" },
  { label: "Rutinas", icon: Dumbbell, href: "/portal/routines" },
  { label: "Perfil", icon: User, href: "/portal/profile" },
];

export function PortalShell({
  children,
  branding,
}: {
  children: React.ReactNode;
  branding?: Record<string, string>;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const gymName = branding?.["GYM_NAME"] || "GymOS";
  const gymLogo = branding?.["GYM_LOGO"];

  return (
    <div className="flex min-h-screen bg-background premium-gradient overflow-x-hidden">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-card border-b border-border/70 dark:border-white/10 z-50 flex items-center justify-between px-4 md:hidden rounded-none border-x-0 border-t-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="bg-primary/15 p-1.5 rounded-lg border border-primary/20 overflow-hidden flex items-center justify-center size-8 relative shrink-0">
            {gymLogo ? (
              <Image src={gymLogo} alt={gymName} fill className="object-cover" sizes="32px" />
            ) : (
              <Dumbbell className="size-4.5 text-primary" />
            )}
          </div>
          <span className="font-serif text-lg tracking-tight truncate max-w-[140px]">
            {gymName}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <NotificationCenter />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menú del portal"
                className="p-2 hover:bg-muted/60 rounded-xl transition-colors"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 bg-background/95 backdrop-blur-xl border-border/70 dark:border-white/10 p-0 flex flex-col"
            >
              <SheetHeader className="p-6 text-left border-b border-border/60">
                <SheetTitle className="flex items-center gap-3">
                  <div className="bg-primary/15 p-2 rounded-xl border border-primary/20 overflow-hidden flex items-center justify-center size-10 relative shrink-0">
                    {gymLogo ? (
                      <Image src={gymLogo} alt={gymName} fill className="object-cover" sizes="40px" />
                    ) : (
                      <Dumbbell className="size-5 text-primary" />
                    )}
                  </div>
                  <span className="font-serif text-2xl truncate">{gymName}</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-2">
                <PortalSidebar
                  isMobile
                  branding={branding}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <PortalSidebar branding={branding} />

      <main className="flex-1 md:ml-72 min-w-0 overflow-x-hidden transition-[margin] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
        <header className="hidden md:flex h-20 items-center justify-end px-8 lg:px-12 gap-3">
          <ThemeToggle />
          <NotificationCenter />
        </header>
        <div className="w-full max-w-7xl px-4 sm:px-8 lg:px-12 py-4 pt-20 pb-24 md:pt-2 md:pb-12 mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Quick Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-border/70 dark:border-white/10 px-2 py-1.5 flex items-center justify-around">
        {MOBILE_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-colors min-w-[56px]",
                isActive
                  ? "text-primary bg-primary/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="size-4.5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
