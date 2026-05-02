"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Calendar, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Package,
  FileText,
  UserCheck,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Miembros", icon: Users, href: "/members" },
  { label: "Membresías", icon: CreditCard, href: "/memberships" },
  { label: "Asistencia", icon: UserCheck, href: "/attendance" },
  { label: "Clases", icon: Calendar, href: "/classes" },
  { label: "Pagos", icon: FileText, href: "/payments" },
  { label: "Inventario", icon: Package, href: "/inventory" },
  { label: "Configuración", icon: Settings, href: "/settings" },
];

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar({ isMobile }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        !isMobile && "fixed left-4 top-4 bottom-4 z-40 glass-card transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-white/5",
        !isMobile && "hidden md:block",
        !isMobile && (isSidebarOpen ? "w-64" : "w-20"),
        isMobile && "w-full"
      )}
    >
      {!isMobile && (
        <div className="flex h-20 items-center justify-between px-4">
          <div className={cn("flex items-center gap-3 transition-all duration-500", !isSidebarOpen && "opacity-0 invisible w-0 translate-x-[-10px]")}>
            <div className="bg-primary/20 p-2 rounded-xl border border-white/10">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <span className="font-serif text-2xl tracking-tight">GymOS</span>
          </div>
          {!isSidebarOpen && (
            <div className="mx-auto bg-primary/20 p-2 rounded-xl border border-white/10">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>
      )}

      <nav className="p-3 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const content = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center rounded-xl transition-all duration-500 overflow-hidden",
                isSidebarOpen ? "gap-3 px-3 py-3" : "justify-center p-3 gap-0",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
              )}
              <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", !isActive && "group-hover:scale-110")} />
              <span className={cn(
                "font-sans text-sm font-medium tracking-wide transition-all duration-500", 
                !isMobile && !isSidebarOpen && "opacity-0 w-0 translate-x-[-10px]"
              )}>
                {item.label}
              </span>
            </Link>
          );

          if (!isMobile && !isSidebarOpen) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  {content}
                </TooltipTrigger>
                <TooltipContent align="center" side="right" className="bg-secondary/90 backdrop-blur-md border-white/10 text-foreground font-medium" >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return content;
        })}
      </nav>

      {!isMobile && (
        <>
          <div className="absolute bottom-4 left-0 right-0 px-3">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-white/5 text-muted-foreground transition-all duration-300"
            >
              {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Subtle branding accent */}
          {isSidebarOpen && (
            <div className="absolute bottom-16 left-6 right-6 p-4 rounded-2xl bg-linear-to-br from-primary/10 to-transparent border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Pro Account</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Gestión élite para resultados extraordinarios.
              </p>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
