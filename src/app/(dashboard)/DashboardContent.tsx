"use client";

import React from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";
import { Menu, Dumbbell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NotificationCenter } from "@/components/shared/NotificationCenter";
import { BranchSwitcher } from "@/components/shared/BranchSwitcher";
import Image from "next/image";

export function DashboardContent({
  children,
  branding,
}: {
  children: React.ReactNode;
  branding?: Record<string, string>;
}) {
  const { isSidebarOpen } = useUIStore();

  const gymName = branding?.["GYM_NAME"] || "GymOS";
  const gymLogo = branding?.["GYM_LOGO"];

  return (
    <div className="flex min-h-screen bg-background premium-gradient overflow-x-hidden">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-card border-white/5 z-50 flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded-lg border border-white/10 overflow-hidden flex items-center justify-center size-8 relative">
            {gymLogo ? (
              <Image src={gymLogo} alt={gymName} fill className="object-cover" sizes="32px" />
            ) : (
              <Dumbbell className="size-5 text-primary" />
            )}
          </div>
          <span className="font-serif text-lg tracking-tight truncate max-w-[120px]">{gymName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <BranchSwitcher />
          <NotificationCenter />
          <Sheet>
            <SheetTrigger asChild>
              <button type="button" aria-label="Toggle menu" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Menu className="size-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-background/80 backdrop-blur-xl border-white/5 p-0">
              <SheetHeader className="p-6 text-left border-b border-white/5">
                <SheetTitle className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center size-10 relative">
                    {gymLogo ? (
                      <Image src={gymLogo} alt={gymName} fill className="object-cover" sizes="40px" />
                    ) : (
                      <Dumbbell className="size-6 text-primary" />
                    )}
                  </div>
                  <span className="font-serif text-2xl">{gymName}</span>
                </SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <Sidebar isMobile branding={branding} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <Sidebar branding={branding} />
      <main 
        className={cn(
          "flex-1 transition-colors duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden",
          isSidebarOpen ? "md:ml-72" : "md:ml-28",
          "ml-0"
        )}
      >
        {/* Desktop Top Bar */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 gap-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <BranchSwitcher />
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
          </div>
        </header>

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pt-20 md:pt-8 overflow-hidden min-h-[calc(100vh-5rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
