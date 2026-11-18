"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  TrendingUp, 
  User,
  Dumbbell,
  LogOut,
  QrCode,
  Users
} from "lucide-react";
import { cn, getUserRole } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MEMBER_ITEMS = [
  { label: "Mi Resumen", icon: LayoutDashboard, href: "/portal" },
  { label: "Mi Tarjeta Virtual", icon: QrCode, href: "/portal/qr" },
  { label: "Mis Clases", icon: Calendar, href: "/portal/classes" },
  { label: "Mis Rutinas", icon: Dumbbell, href: "/portal/routines" },
  { label: "Mi Progreso", icon: TrendingUp, href: "/portal/progress" },
  { label: "Mi Perfil", icon: User, href: "/portal/profile" },
];

const TRAINER_ITEMS = [
  { label: "Panel Principal", icon: LayoutDashboard, href: "/portal/trainer" },
  { label: "Mis Alumnos", icon: Users, href: "/portal/trainer/members" },
  { label: "Gestión de Clases", icon: Calendar, href: "/portal/trainer/classes" },
];

export function PortalSidebar({
  branding,
  isMobile,
  onNavigate,
}: {
  branding?: Record<string, string>;
  isMobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { push } = useRouter();
  const { data: session } = authClient.useSession();

  const gymName = branding?.["GYM_NAME"] || "GymOS";
  const gymLogo = branding?.["GYM_LOGO"];

  const userRole = getUserRole(session);
  const isTrainer = userRole === "TRAINER" || userRole === "ADMIN" || userRole === "SUPER_ADMIN";

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

  const memberItems = MEMBER_ITEMS;
  const trainerItems = TRAINER_ITEMS;

  return (
    <aside
      className={cn(
        !isMobile &&
          "fixed left-4 top-4 bottom-4 w-64 z-40 glass-card border-border/70 dark:border-white/10 hidden md:flex flex-col",
        isMobile && "flex flex-col w-full h-full",
      )}
    >
      {!isMobile && (
        <div className="p-7 pb-6 flex items-center gap-3">
          {gymLogo ? (
            <Image src={gymLogo} alt={gymName} width={34} height={34} className="size-8.5 rounded-xl object-contain" />
          ) : (
            <div className="bg-primary/15 p-2 rounded-xl border border-primary/20">
              <Dumbbell className="size-5 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <span className="font-serif text-2xl tracking-tight truncate block leading-none">{gymName}</span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-bold">Member Portal</span>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3.5 space-y-7 overflow-y-auto no-scrollbar">
        {/* Trainer Section */} 
        {isTrainer && (
          <div className="space-y-1.5">
            <p className="px-3.5 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">Gestión Técnica</p>
            <div className="space-y-1">
              {trainerItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                        : "text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-4.5 transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-primary-foreground" : "text-primary/80"
                      )}
                    />
                    <span className="font-sans text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Member Section */}
        <div className="space-y-1.5">
          <p className="px-3.5 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">Mi Espacio</p>
          <div className="space-y-1">
            {memberItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4.5 transition-transform duration-200 group-hover:scale-110",
                      isActive ? "text-primary-foreground" : "text-primary/80"
                    )}
                  />
                  <span className="font-sans text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-3.5 pt-2">
        <div className="p-3.5 rounded-2xl bg-muted/40 dark:bg-white/[0.04] border border-border/70 dark:border-white/10 flex items-center gap-3">
          <Avatar className="size-10 border border-border/80 dark:border-white/10">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-primary/15 text-primary font-bold text-xs">
              {session?.user?.name?.substring(0, 2).toUpperCase() || gymName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{session?.user?.name || "Usuario"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              {isTrainer ? "Entrenador" : "Socio Activo"}
            </p>
          </div>
          <button type="button" 
            aria-label="Cerrar sesión"
            onClick={handleLogout}
            className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
