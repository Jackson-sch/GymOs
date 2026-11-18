"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface SuspendedClientProps {
  reason: "ORG_SUSPENDED" | "USER_SUSPENDED" | "UNAUTHENTICATED";
  orgName?: string;
  userEmail?: string | null;
}

export function SuspendedClient({ reason, orgName, userEmail }: SuspendedClientProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const isOrgSuspended = reason === "ORG_SUSPENDED";

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch {
      router.push("/login");
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background premium-gradient p-4">
      <div className="w-full max-w-md glass-card p-5 sm:p-8 border-border/80 dark:border-white/10 rounded-3xl shadow-2xl text-center space-y-6">
        <div className="size-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
          <ShieldAlert className="size-8" />
        </div>

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-rose-600 dark:text-rose-400">
            Acceso Restringido
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            {isOrgSuspended ? "Gimnasio Suspendido" : "Cuenta Suspendida"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isOrgSuspended ? (
              <>
                La suscripción de{" "}
                <span className="font-semibold text-foreground">{orgName || "tu gimnasio"}</span>{" "}
                ha sido suspendida temporalmente por la administración de la plataforma.
              </>
            ) : (
              <>
                Tu cuenta de usuario ha sido desactivada temporalmente. Contacta con la
                administración de tu gimnasio para restablecer el acceso.
              </>
            )}
          </p>
        </div>

        {userEmail && (
          <div className="px-4 py-2.5 rounded-xl bg-muted/40 dark:bg-white/5 border border-border/70 dark:border-white/10 text-xs text-muted-foreground">
            Sesión actual: <span className="font-medium text-foreground">{userEmail}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.refresh()}
            className="flex-1 h-11 rounded-xl border-border/80 gap-2 text-xs font-semibold"
          >
            <RefreshCw className="size-4" />
            Verificar de nuevo
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLogout}
            disabled={signingOut}
            className="flex-1 h-11 rounded-xl gap-2 text-xs font-bold uppercase tracking-wider"
          >
            {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
