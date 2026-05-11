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
  Sparkles,
  LogOut,
  TrendingDown,
  ScanLine,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Miembros", icon: Users, href: "/members" },
  { label: "Membresías", icon: CreditCard, href: "/memberships" },
  { label: "Asistencia", icon: UserCheck, href: "/attendance" },
  { label: "Clases", icon: Calendar, href: "/classes" },
  { label: "Entrenadores", icon: Sparkles, href: "/trainers" },
  { label: "Ingresos", icon: FileText, href: "/payments" },
  { label: "Egresos", icon: TrendingDown, href: "/expenses" },
  { label: "Inventario", icon: Package, href: "/inventory" },
  { label: "Rutinas", icon: Dumbbell, href: "/routines" },
  { label: "Reportes", icon: FileText, href: "/reports" },
  { label: "Kiosco", icon: ScanLine, href: "/kiosk" },
  { label: "Configuración", icon: Settings, href: "/settings" },
  { label: "Auditoría", icon: Shield, href: "/audit-log" },
];

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar({ 
  isMobile,
  branding
}: { 
  isMobile?: boolean;
  branding?: Record<string, string>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { data: session, isPending } = authClient.useSession();

  const gymName = branding?.["GYM_NAME"] || "GymOS";
  const gymLogo = branding?.["GYM_LOGO"];

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

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
        <>
          {/* New Toggle Button - Positioned at top right edge */}
          <button
            onClick={toggleSidebar}
            className={cn(
              "absolute -right-3 top-8 z-50 w-7 h-7 flex items-center justify-center rounded-full glass-card border border-white/10 shadow-lg hover:scale-110 transition-all duration-300 group",
              "text-muted-foreground hover:text-primary"
            )}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            ) : (
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>

          <div className="flex h-20 items-center justify-between px-4">
            <div className={cn("flex items-center gap-3 transition-all duration-500", !isSidebarOpen && "opacity-0 invisible w-0 translate-x-[-10px]")}>
              <div className="bg-primary/20 p-2 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                {gymLogo ? (
                  <img src={gymLogo} alt={gymName} className="w-6 h-6 object-cover" />
                ) : (
                  <Dumbbell className="w-6 h-6 text-primary" />
                )}
              </div>
              <span className="font-serif text-2xl tracking-tight">{gymName}</span>
            </div>
            {!isSidebarOpen && (
              <div className="mx-auto bg-primary/20 p-2 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                {gymLogo ? (
                  <img src={gymLogo} alt={gymName} className="w-6 h-6 object-cover" />
                ) : (
                  <Dumbbell className="w-6 h-6 text-primary" />
                )}
              </div>
            )}
          </div>
        </>
      )}

      <nav className="p-3 space-y-1.5 h-[calc(100%-160px)] overflow-y-auto custom-scrollbar">
        <TooltipProvider>
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
        </TooltipProvider>
      </nav>

      {!isMobile && (
        <div className="absolute bottom-4 left-0 right-0 space-y-4 px-3">
          {/* User Profile Section */}
          <div className={cn(
            "p-2 rounded-2xl bg-white/5 border border-white/5 transition-all duration-500",
            !isSidebarOpen ? "mx-auto w-12 flex justify-center" : "flex items-center gap-3"
          )}>
            <Avatar className="w-8 h-8 border border-white/10">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                {session?.user?.name?.substring(0, 2).toUpperCase() || "GY"}
              </AvatarFallback>
            </Avatar>
            
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {session?.user?.name || "Invitado"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">
                  Admin Account
                </p>
              </div>
            )}

            {isSidebarOpen && (
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isSidebarOpen && (
             <TooltipProvider>
               <Tooltip delayDuration={0}>
                 <TooltipTrigger asChild>
                   <button 
                    onClick={handleLogout}
                    className="mx-auto w-10 h-10 flex items-center justify-center rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                   >
                     <LogOut className="w-4 h-4" />
                   </button>
                 </TooltipTrigger>
                 <TooltipContent side="right" className="bg-destructive text-white border-none font-bold">
                    Cerrar Sesión
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>
          )}
        </div>
      )}
    </aside>
  );
}
