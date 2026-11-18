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
  Shield,
  MapPin
} from "lucide-react";
import { cn, getUserRole } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles: string[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "Torre SaaS",
    items: [
      { label: "Torre SaaS Global", icon: Shield, href: "/super-admin", roles: ["SUPER_ADMIN"] },
      { label: "Canales & Claves API", icon: Settings, href: "/settings?tab=api", roles: ["SUPER_ADMIN"] },
      { label: "Auditoría Global", icon: Shield, href: "/audit-log", roles: ["SUPER_ADMIN"] },
    ],
  },
  {
    title: "Principal",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/", roles: ["ADMIN", "RECEPTIONIST"] },
      { label: "Dashboard", icon: LayoutDashboard, href: "/portal/trainer", roles: ["TRAINER"] },
    ],
  },
  {
    title: "Operación Diaria",
    items: [
      { label: "Miembros", icon: Users, href: "/members", roles: ["ADMIN", "RECEPTIONIST"] },
      { label: "Mis Alumnos", icon: Users, href: "/portal/trainer/members", roles: ["TRAINER"] },
      { label: "Asistencia", icon: UserCheck, href: "/attendance", roles: ["ADMIN", "TRAINER", "RECEPTIONIST"] },
      { label: "Kiosco", icon: ScanLine, href: "/kiosk", roles: ["ADMIN", "RECEPTIONIST"] },
      { label: "Clases", icon: Calendar, href: "/classes", roles: ["ADMIN", "TRAINER", "RECEPTIONIST"] },
      { label: "Rutinas", icon: Dumbbell, href: "/routines", roles: ["ADMIN", "TRAINER"] },
    ],
  },
  {
    title: "Comercial & Finanzas",
    items: [
      { label: "Membresías", icon: CreditCard, href: "/memberships", roles: ["ADMIN", "RECEPTIONIST"] },
      { label: "Ingresos", icon: FileText, href: "/payments", roles: ["ADMIN", "RECEPTIONIST"] },
      { label: "Egresos", icon: TrendingDown, href: "/expenses", roles: ["ADMIN"] },
      { label: "Reportes", icon: FileText, href: "/reports", roles: ["ADMIN"] },
    ],
  },
  {
    title: "Infraestructura",
    items: [
      { label: "Entrenadores", icon: Sparkles, href: "/trainers", roles: ["ADMIN"] },
      { label: "Inventario", icon: Package, href: "/inventory", roles: ["ADMIN", "RECEPTIONIST"] },
      { label: "Sedes & Sucursales", icon: MapPin, href: "/branches", roles: ["ADMIN"] },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Configuración", icon: Settings, href: "/settings", roles: ["ADMIN"] },
      { label: "Auditoría", icon: Shield, href: "/audit-log", roles: ["ADMIN"] },
    ],
  },
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
        !isMobile && "fixed left-4 top-4 bottom-4 z-40 glass-card transition-[width,opacity,visibility,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-white/5",
        !isMobile && "hidden md:block",
        !isMobile && (isSidebarOpen ? "w-64" : "w-20"),
        isMobile && "w-full"
      )}
    >
      {!isMobile && (
        <>
          {/* New Toggle Button - Positioned at top right edge */}
          <button type="button"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            onClick={toggleSidebar}
            className={cn(
              "absolute -right-3 top-8 z-50 size-7 flex items-center justify-center rounded-full glass-card border border-white/10 shadow-lg hover:scale-110 transition group",
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
            <div className={cn("flex items-center gap-3 transition-[opacity,visibility,transform,width] duration-500", !isSidebarOpen && "opacity-0 invisible w-0 translate-x-[-10px]")}>
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

      <nav className="p-3 space-y-3 h-[calc(100%-160px)] overflow-y-auto custom-scrollbar">
        <TooltipProvider>
          {menuGroups.map((group, groupIndex) => {
            const role = getUserRole(session);
            const visibleItems = group.items.filter((item) => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                {(isMobile || isSidebarOpen) ? (
                  <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
                    {group.title}
                  </p>
                ) : (
                  groupIndex > 0 && <div className="mx-2 my-1.5 border-t border-border/60" />
                )}

                {visibleItems.map((item) => {
                  const basePath = item.href.split("?")[0];
                  const isActive =
                    basePath === "/"
                      ? pathname === "/"
                      : pathname === basePath || pathname.startsWith(`${basePath}/`);

                  const content = (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center rounded-xl transition-[padding,background-color,color,box-shadow,justify-content] duration-300 overflow-hidden",
                        (isMobile || isSidebarOpen) ? "gap-3 px-3 py-2" : "justify-center p-2.5 gap-0",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-white/5",
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 w-1 h-5 bg-primary-foreground rounded-r-full" />
                      )}
                      <item.icon className={cn("size-[18px] shrink-0 transition-transform duration-300", !isActive && "group-hover:scale-110")} />
                      <span
                        className={cn(
                          "font-sans text-[13px] font-medium tracking-wide transition-[opacity,width,transform] duration-300 truncate",
                          !isMobile && !isSidebarOpen && "opacity-0 w-0 translate-x-[-10px]",
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );

                  if (!isMobile && !isSidebarOpen) {
                    return (
                      <Tooltip key={item.href} delayDuration={0}>
                        <TooltipTrigger asChild>{content}</TooltipTrigger>
                        <TooltipContent
                          align="center"
                          side="right"
                          className="bg-popover/95 backdrop-blur-md border-border text-foreground font-medium"
                        >
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return content;
                })}
              </div>
            );
          })}
        </TooltipProvider>
      </nav>

      {!isMobile && (
        <div className="absolute bottom-4 left-0 right-0 space-y-4 px-3">
          {/* User Profile Section */}
          <div className={cn(
            "p-2 rounded-2xl bg-muted/50 dark:bg-white/5 border border-border/60 dark:border-white/5 transition",
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
                      {getUserRole(session) === "SUPER_ADMIN" ? "Super Admin SaaS" : 
                       getUserRole(session) === "TRAINER" ? "Staff Técnico" : 
                       getUserRole(session) === "MEMBER" ? "Socio" : "Admin Gimnasio"}
                    </p>
                  </div>
                )}

                {isSidebarOpen && (
                  <button type="button" 
                    aria-label="Logout"
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
                    <button type="button" 
                     aria-label="Logout"
                     onClick={handleLogout}
                     className="mx-auto size-10 flex items-center justify-center rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
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
