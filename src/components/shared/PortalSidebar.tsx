"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  TrendingUp, 
  User,
  Dumbbell,
  LogOut,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  { label: "Mi Resumen", icon: LayoutDashboard, href: "/portal" },
  { label: "Mis Clases", icon: Calendar, href: "/portal/classes" },
  { label: "Mis Rutinas", icon: Dumbbell, href: "/portal/routines" },
  { label: "Mi Progreso", icon: TrendingUp, href: "/portal/progress" },
  { label: "Mi Perfil", icon: User, href: "/portal/profile" },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

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
    <aside className="fixed left-4 top-4 bottom-4 w-64 z-40 glass-card border-white/5 hidden md:flex flex-col">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-xl border border-white/10">
          <Dumbbell className="w-6 h-6 text-primary" />
        </div>
        <span className="font-serif text-2xl tracking-tight">GymOS</span>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-sans text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-white/10">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {session?.user?.name?.substring(0, 2).toUpperCase() || "MB"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{session?.user?.name || "Socio"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Portal de Socio</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
