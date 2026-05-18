"use client";

import React from "react";
import { Mail, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationsTabProps {
  formState: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export function NotificationsTab({ formState, handleChange }: NotificationsTabProps) {
  return (
    <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-2xl font-serif mb-1">Notificaciones</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Mensajería y alertas automáticas
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-6 rounded-2xl bg-white/2 border border-white/5">
          <div className="flex items-center gap-4">
            <Mail className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Emails de Bienvenida</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                Enviar automáticamente al registrar socios
              </p>
            </div>
          </div>
          <Button
            variant={
              formState["NOTIFY_WELCOME"] === "true" ? "default" : "outline"
            }
            onClick={() =>
              handleChange(
                "NOTIFY_WELCOME",
                formState["NOTIFY_WELCOME"] === "true" ? "false" : "true",
              )
            }
            className="rounded-lg h-9 text-[10px] uppercase tracking-widest font-bold"
          >
            {formState["NOTIFY_WELCOME"] === "true"
              ? "Activado"
              : "Desactivado"}
          </Button>
        </div>

        <div className="flex items-center justify-between p-6 rounded-2xl bg-white/2 border border-white/5">
          <div className="flex items-center gap-4">
            <Smartphone className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Recordatorios WhatsApp</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                Alertas de vencimiento de membresía
              </p>
            </div>
          </div>
          <Button
            variant={
              formState["NOTIFY_EXPIRY"] === "true" ? "default" : "outline"
            }
            onClick={() =>
              handleChange(
                "NOTIFY_EXPIRY",
                formState["NOTIFY_EXPIRY"] === "true" ? "false" : "true",
              )
            }
            className="rounded-lg h-9 text-[10px] uppercase tracking-widest font-bold"
          >
            {formState["NOTIFY_EXPIRY"] === "true"
              ? "Activado"
              : "Desactivado"}
          </Button>
        </div>

        {/* Banner para acceder al Centro de Control de Notificaciones */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
          <div>
            <h3 className="text-lg font-serif font-semibold text-foreground">Centro de Control de Comunicaciones</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Supervisa y audita el historial completo de SMS, correos electrónicos y notificaciones enviadas a los socios.
            </p>
          </div>
          <Button asChild variant="default" className="rounded-xl px-6 h-10 shadow-lg shadow-primary/25 shrink-0 font-bold uppercase text-[10px] tracking-wider">
            <a href="/settings/notifications">Abrir Centro de Control</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
