"use client";

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

export function PortalSidebar({ branding }: { branding?: Record<string, string> }) {
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

  const memberItems = [
    { label: "Mi Resumen", icon: LayoutDashboard, href: "/portal" },
    { label: "Mi Tarjeta Virtual", icon: QrCode, href: "/portal/qr" },
    { label: "Mis Clases", icon: Calendar, href: "/portal/classes" },
    { label: "Mis Rutinas", icon: Dumbbell, href: "/portal/routines" },
    { label: "Mi Progreso", icon: TrendingUp, href: "/portal/progress" },
    { label: "Mi Perfil", icon: User, href: "/portal/profile" },
  ];

  const trainerItems = [
    { label: "Panel Principal", icon: LayoutDashboard, href: "/portal/trainer" },
    { label: "Mis Alumnos", icon: Users, href: "/portal/trainer/members" },
    { label: "Gestión de Clases", icon: Calendar, href: "/portal/trainer/classes" },
  ];

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 z-40 glass-card border-white/5 hidden md:flex flex-col">
      <div className="p-8 flex items-center gap-3">
        {gymLogo ? (
          <img src={gymLogo} alt={gymName} className="size-8 rounded-xl object-contain" />
        ) : (
          <div className="bg-primary/20 p-2 rounded-xl border border-white/10">
            <Dumbbell className="size-6 text-primary" />
          </div>
        )}
        <span className="font-serif text-2xl tracking-tight truncate">{gymName}</span>
      </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar">
        {/* Trainer Section */}
        {isTrainer && (
          <div className="space-y-2">
            <p className="px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/50">Gestión Técnica</p>
            <div className="space-y-1">
              {trainerItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-5 transition-transform duration-300 group-hover:scale-110",
                        isActive ? "text-primary-foreground" : "text-primary/70"
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
        <div className="space-y-2">
          <p className="px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/50">Mi Perfil Personal</p>
          <div className="space-y-1">
            {memberItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-5 transition-transform duration-300 group-hover:scale-110",
                      isActive ? "text-primary-foreground" : "text-primary/70"
                    )}
                  />
                  <span className="font-sans text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
          <Avatar className="size-10 border border-white/10">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {session?.user?.name?.substring(0, 2).toUpperCase() || gymName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{session?.user?.name || "Usuario"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              {isTrainer ? "Portal Entrenador" : "Portal de Socio"}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:text-destructive transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
