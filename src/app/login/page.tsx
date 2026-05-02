"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Credenciales incorrectas");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background premium-gradient">
      {/* Decorative elements for depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md glass-card p-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-8">
          <div className="relative">
            <div className="bg-primary/20 p-4 rounded-3xl backdrop-blur-md border border-white/10 interactive-hover">
              <Dumbbell className="w-10 h-10 text-primary" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-accent animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-5xl font-serif text-foreground leading-tight tracking-tight">
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
                className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">
                  Clave de Acceso
                </Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-all"
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
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] italic">
            "La excelencia es un hábito, no un acto."
          </p>
        </div>
      </div>
      
      {/* Subtle branding footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
        <span className="text-[10px] text-muted-foreground/20 font-sans tracking-[0.3em] uppercase">
          Powered by Antigravity Design System
        </span>
      </div>
    </div>
  );
}
