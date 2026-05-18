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
import { cn, getUserRole } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", roles: ["ADMIN", "SUPER_ADMIN", "RECEPTIONIST"] },
  { label: "Dashboard", icon: LayoutDashboard, href: "/portal/trainer", roles: ["TRAINER"] },
  { label: "Mis Alumnos", icon: Users, href: "/portal/trainer/members", roles: ["TRAINER"] },
  { label: "Miembros", icon: Users, href: "/members", roles: ["ADMIN", "SUPER_ADMIN", "RECEPTIONIST"] },
  { label: "Membresías", icon: CreditCard, href: "/memberships", roles: ["ADMIN", "SUPER_ADMIN", "RECEPTIONIST"] },
  { label: "Asistencia", icon: UserCheck, href: "/attendance", roles: ["ADMIN", "SUPER_ADMIN", "TRAINER", "RECEPTIONIST"] },
  { label: "Clases", icon: Calendar, href: "/classes", roles: ["ADMIN", "SUPER_ADMIN", "TRAINER", "RECEPTIONIST"] },
  { label: "Entrenadores", icon: Sparkles, href: "/trainers", roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Ingresos", icon: FileText, href: "/payments", roles: ["ADMIN", "SUPER_ADMIN", "RECEPTIONIST"] },
  { label: "Egresos", icon: TrendingDown, href: "/expenses", roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Inventario", icon: Package, href: "/inventory", roles: ["ADMIN", "SUPER_ADMIN", "RECEPTIONIST"] },
  { label: "Rutinas", icon: Dumbbell, href: "/routines", roles: ["ADMIN", "SUPER_ADMIN", "TRAINER"] },
  { label: "Reportes", icon: FileText, href: "/reports", roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Kiosco", icon: ScanLine, href: "/kiosk", roles: ["ADMIN", "SUPER_ADMIN", "RECEPTIONIST"] },
  { label: "Configuración", icon: Settings, href: "/settings", roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Auditoría", icon: Shield, href: "/audit-log", roles: ["ADMIN", "SUPER_ADMIN"] },
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
  const { push } = useRouter();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { data: session, isPending } = authClient.useSession();

  const gymName = branding?.["GYM_NAME"] || "GymOS";
  const gymLogo = branding?.["GYM_LOGO"];

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            push("/login");
          },
        },
      });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      push("/login");
    } finally {
      push("/login");
    }
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
              "absolute -right-3 top-8 z-50 size-7 flex items-center justify-center rounded-full glass-card border border-white/10 shadow-lg hover:scale-110 transition-all duration-300 group",
              "text-muted-foreground hover:text-primary"
            )}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            ) : (
              <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>

          <div className="flex h-20 items-center justify-between px-4">
            <div className={cn("flex items-center gap-3 transition-all duration-500", !isSidebarOpen && "opacity-0 invisible w-0 translate-x-[-10px]")}>
              <div className="bg-primary/20 p-2 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center size-10 relative">
                {gymLogo ? (
                  <Image src={gymLogo} alt={gymName} fill sizes="40px" className="object-cover" />
                ) : (
                  <Dumbbell className="size-6 text-primary" />
                )}
              </div>
              <span className="font-serif text-2xl tracking-tight">{gymName}</span>
            </div>
            {!isSidebarOpen && (
              <div className="mx-auto bg-primary/20 p-2 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center size-10 relative">
                {gymLogo ? (
                  <Image src={gymLogo} alt={gymName} fill sizes="40px" className="object-cover" />
                ) : (
                  <Dumbbell className="size-6 text-primary" />
                )}
              </div>
            )}
          </div>
        </>
      )}

      <nav className="p-3 space-y-1.5 h-[calc(100%-160px)] overflow-y-auto custom-scrollbar">
        <TooltipProvider>
          {menuItems.filter(item => item.roles.includes(getUserRole(session))).map((item) => {
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
                <item.icon className={cn("size-5 shrink-0 transition-transform duration-300", !isActive && "group-hover:scale-110")} />
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
            {isPending ? (
              <>
                <div className="size-8 rounded-full bg-white/10 animate-pulse border border-white/5" />
                {isSidebarOpen && (
                  <div className="flex-1 space-y-2 py-1 min-w-0">
                    <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                    <div className="h-2 w-12 bg-white/5 rounded animate-pulse" />
                  </div>
                )}
              </>
            ) : (
              <>
                <Avatar className="size-8 border border-white/10">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-semibold">
                    {session?.user?.name?.substring(0, 2).toUpperCase() || gymName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {isSidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {session?.user?.name || "Invitado"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">
                      {getUserRole(session) === "TRAINER" ? "Staff Técnico" : 
                       getUserRole(session) === "MEMBER" ? "Socio" : "Administrador"}
                    </p>
                  </div>
                )}

                {isSidebarOpen && (
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <LogOut className="size-4" />
                  </button>
                )}
              </>
            )}
          </div>

          {!isSidebarOpen && (
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button 
                     onClick={handleLogout}
                     className="mx-auto size-10 flex items-center justify-center rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <LogOut className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-destructive text-white border-none font-semibold">
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
