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

export function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="flex min-h-screen bg-background premium-gradient overflow-x-hidden">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-card border-white/5 z-50 flex items-center justify-between px-6 md:hidden">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded-lg border border-white/10">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <span className="font-serif text-xl tracking-tight">GymOS</span>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-background/80 backdrop-blur-xl border-white/5 p-0">
            <SheetHeader className="p-6 text-left border-b border-white/5">
              <SheetTitle className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-xl border border-white/10">
                  <Dumbbell className="w-6 h-6 text-primary" />
                </div>
                <span className="font-serif text-2xl">GymOS</span>
              </SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <Sidebar isMobile />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <Sidebar />
      <main 
        className={cn(
          "flex-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden",
          isSidebarOpen ? "md:ml-72" : "md:ml-28",
          "ml-0"
        )}
      >
        <div className="w-full max-w-[100vw] px-4 sm:px-8 lg:px-12 py-20 md:py-12 mx-auto overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
