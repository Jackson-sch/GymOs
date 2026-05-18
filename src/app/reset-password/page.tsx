"use client";

import React, { useState, type SyntheticEvent, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Reset password state (when token exists)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Request link state (when token does not exist)
  const [requestEmail, setRequestEmail] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [requestError, setRequestError] = useState("");

  const handleReset = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      setError("Token de recuperación inválido o expirado.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await authClient.resetPassword({
      newPassword,
      token,
    });

    if (error) {
      setError(error.message || "Error al restablecer la contraseña. El enlace puede haber caducado.");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleRequestLink = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setRequestError("");
    setRequestStatus("");

    const { error } = await authClient.requestPasswordReset({
      email: requestEmail,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setRequestError(error.message || "Error al solicitar el enlace. Verifica el correo e intenta de nuevo.");
    } else {
      setRequestStatus("Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada o carpeta de spam.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md glass-card p-8 relative z-10">
      <div className="flex flex-col items-center text-center space-y-4 mb-6">
        <div className="bg-primary/20 p-4 rounded-3xl backdrop-blur-md border border-white/10">
          <KeyRound className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-serif text-foreground">
          {token ? "Restablecer Contraseña" : "Recuperar Contraseña"}
        </h1>
        <p className="text-xs text-muted-foreground max-w-xs">
          {success ? "Tu clave ha sido actualizada exitosamente." : token ? "Crea una nueva contraseña segura para tu cuenta en GymOS." : "Ingresa tu correo registrado para recibir un enlace de recuperación."}
        </p>
      </div>

      {success ? (
        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <p className="text-sm font-semibold text-green-400">¡Contraseña actualizada con éxito!</p>
          <p className="text-xs text-muted-foreground">Ahora puedes acceder al sistema con tu nueva clave de acceso.</p>
          <Button 
            asChild 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 mt-4"
          >
            <Link href="/login">Ir a Iniciar Sesión</Link>
          </Button>
        </div>
      ) : !token ? (
        <div className="space-y-6">
          {requestStatus ? (
            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-xs font-semibold text-green-400">{requestStatus}</p>
              <Button 
                asChild 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 mt-4"
              >
                <Link href="/login">Volver a Iniciar Sesión</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRequestLink} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="requestEmail" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">
                  Correo Electrónico
                </Label>
                <Input 
                  id="requestEmail" 
                  type="email" 
                  placeholder="correo@gymos.com"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  required 
                  className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              {requestError && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl animate-in shake duration-300">
                  <p className="text-xs text-rose-500 text-center font-medium">{requestError}</p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-sans font-semibold tracking-wide shadow-lg shadow-primary/20" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Enlace de Recuperación"}
                </Button>

                <Button 
                  asChild
                  variant="ghost" 
                  className="w-full h-12 text-muted-foreground hover:text-foreground rounded-xl text-xs uppercase tracking-wider"
                >
                  <Link href="/login"><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Identidad Digital</Link>
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">
                Nueva Clave de Acceso
              </Label>
              <Input 
                id="newPassword" 
                type="password" 
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
                className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-all font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">
                Confirmar Clave de Acceso
              </Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50 focus:border-primary/50 transition-all font-mono text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl animate-in shake duration-300">
              <p className="text-xs text-rose-500 text-center font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-sans font-semibold tracking-wide shadow-lg shadow-primary/20" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Nueva Contraseña"}
            </Button>

            <Button 
              asChild
              variant="ghost" 
              className="w-full h-12 text-muted-foreground hover:text-foreground rounded-xl text-xs uppercase tracking-wider"
            >
              <Link href="/login"><ArrowLeft className="w-4 h-4 mr-2" /> Cancelar y Volver</Link>
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 pt-8 border-t border-white/5 text-center">
        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] italic">
          "La seguridad es la base de la confianza."
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background premium-gradient">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />

      <Suspense fallback={<div className="w-full max-w-md p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <ResetPasswordContent />
      </Suspense>

      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
        <span className="text-[10px] text-muted-foreground/20 font-sans tracking-[0.3em] uppercase">
          Powered by Antigravity Design System
        </span>
      </div>
    </div>
  );
}
