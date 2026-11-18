"use client";

import React, { useEffect, useState, type SyntheticEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Loader2, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DevUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const IS_DEV = process.env.NODE_ENV === "development";

const ROLE_BADGE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ADMIN: "bg-primary/15 text-primary border-primary/30",
  TRAINER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  RECEPTIONIST: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  MEMBER: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

function getRedirectPath(user?: { role?: string; mustChangePassword?: boolean }) {
  if (user?.mustChangePassword) return "/force-change-password";
  if (user?.role === "SUPER_ADMIN") return "/super-admin";
  if (user?.role === "MEMBER") return "/portal";
  if (user?.role === "TRAINER") return "/portal/trainer";
  return "/";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoadingEmail, setQuickLoadingEmail] = useState<string | null>(null);
  const [devUsers, setDevUsers] = useState<DevUser[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!IS_DEV) return;
    let active = true;
    fetch("/api/dev/quick-login")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.users)) {
          setDevUsers(data.users);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleQuickLogin = async (targetEmail: string) => {
    if (!IS_DEV || loading || quickLoadingEmail) return;
    setQuickLoadingEmail(targetEmail);
    setError("");
    try {
      const res = await fetch("/api/dev/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "No se pudo iniciar sesión rápida");
        return;
      }
      router.push(getRedirectPath(data.user));
      router.refresh();
    } catch {
      setError("Error de conexión al iniciar sesión rápida");
    } finally {
      setQuickLoadingEmail(null);
    }
  };

  const handleLogin = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Credenciales incorrectas");
      } else {
        const { data: session } = await authClient.getSession();
        const user = session?.user as { role?: string; mustChangePassword?: boolean } | undefined;
        router.push(getRedirectPath(user));
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background premium-gradient">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md glass-card p-5 sm:p-8 relative z-10">
        <div className="space-y-6 animate-slide-left-fast">
          <div className="flex flex-col items-center text-center space-y-6 mb-8">
            <div className="relative">
              <div className="bg-primary/20 p-4 rounded-3xl backdrop-blur-md border border-white/10 interactive-hover">
                <Dumbbell className="w-10 h-10 text-primary" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-accent animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-serif text-foreground leading-tight tracking-tight">
                GymOS
              </h1>
              <p className="text-muted-foreground font-sans uppercase tracking-[0.2em] text-[10px] font-semibold">
                Elite Fitness Management
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">
                  Identidad Digital
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@gymos.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-colors placeholder:text-muted-foreground/60"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">
                    Clave de Acceso
                  </Label>
                  <Link 
                    href="/reset-password"
                    className="text-[10px] text-primary hover:underline uppercase tracking-wider font-bold"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                <p className="text-xs text-rose-500 text-center font-medium">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Ingresar al Portal"
              )}
            </Button>

            <div className="pt-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">
                ¿No eres socio aún?{" "}
                <Link href="/register" className="text-primary hover:underline font-bold">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>

          {IS_DEV && devUsers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                  Accesos Rápidos (Dev)
                </span>
                <span className="text-[10px] text-muted-foreground/70">
                  Solo desarrollo
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                {devUsers.map((devUser) => {
                  const isBusy = quickLoadingEmail === devUser.email;
                  const badgeStyle =
                    ROLE_BADGE_STYLES[devUser.role] ||
                    "bg-white/10 text-foreground border-white/20";

                  return (
                    <button
                      key={devUser.id}
                      type="button"
                      disabled={loading || quickLoadingEmail !== null}
                      onClick={() => handleQuickLogin(devUser.email)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 transition-all text-left disabled:opacity-50"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {devUser.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {devUser.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle}`}
                        >
                          {devUser.role}
                        </span>
                        {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-muted-foreground/80 uppercase tracking-[0.15em] italic">
              "La excelencia es un hábito, no un acto."
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
        <span className="text-[10px] text-muted-foreground/60 font-sans tracking-[0.3em] uppercase">
          Powered by Antigravity Design System
        </span>
      </div>
    </div>
  );
}
