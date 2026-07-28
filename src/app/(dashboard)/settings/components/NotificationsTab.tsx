"use client";

import Link from "next/link";
import { Mail, Smartphone, Bell, ReceiptText, Cake, BarChart3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface NotificationsTabProps {
  formState: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

const NOTIFICATION_ITEMS = [
  {
    key: "NOTIFY_WELCOME",
    title: "Emails de Bienvenida",
    description: "Enviar automáticamente credenciales y código QR al registrar un nuevo socio en el gimnasio.",
    icon: Mail,
    category: "EMAIL",
  },
  {
    key: "NOTIFY_EXPIRY",
    title: "Recordatorios de Vencimiento (WhatsApp)",
    description: "Enviar alerta automática 3 días antes de la fecha fin de membresía vía Meta WhatsApp API.",
    icon: Smartphone,
    category: "WHATSAPP",
  },
  {
    key: "NOTIFY_PAYMENT_RECEIPT",
    title: "Recibo Digital Instantáneo (Email)",
    description: "Enviar comprobante de pago en PDF por correo electrónico al procesar un cobro o suscripción.",
    icon: ReceiptText,
    category: "EMAIL",
  },
  {
    key: "NOTIFY_BIRTHDAY",
    title: "Saludo Automático de Cumpleaños",
    description: "Enviar mensaje personalizado de felicitación por WhatsApp el día del cumpleaños del socio.",
    icon: Cake,
    category: "WHATSAPP",
  },
  {
    key: "NOTIFY_DAILY_SUMMARY",
    title: "Informe Diario para Administración",
    description: "Recibir correo a medianoche con el resumen de caja, ingresos totales y nuevos socios del día.",
    icon: BarChart3,
    category: "ADMIN",
  },
];

export function NotificationsTab({ formState, handleChange }: NotificationsTabProps) {
  const notificationItems = NOTIFICATION_ITEMS;

  return (
    <section className="glass-card p-6 sm:p-8 md:p-10 border-white/10 space-y-8 animate-slide-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-serif mb-1">Notificaciones & Mensajería</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Reglas de automatización y notificaciones para socios y administración
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary uppercase text-[10px] tracking-widest px-3 py-1 font-bold w-fit">
          <Bell className="size-3 mr-1.5" /> 5 Disparadores Activos
        </Badge>
      </div>

      <div className="space-y-4">
        {notificationItems.map((item) => {
          const Icon = item.icon;
          const isEnabled = formState[item.key] === "true" || formState[item.key] === undefined;

          return (
            <div
              key={item.key}
              className="flex items-center justify-between p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-white/15 transition-colors gap-4"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Icon className="size-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-mono px-1.5 py-0 border-white/10 bg-white/5 text-muted-foreground"
                    >
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground hidden sm:inline">
                  {isEnabled ? "Activado" : "Inactivo"}
                </span>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) =>
                    handleChange(item.key, checked ? "true" : "false")
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner al Centro de Control de Comunicaciones */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xl backdrop-blur-md">
        <div className="space-y-1">
          <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
            <Bell className="size-5 text-primary" /> Centro de Control de Notificaciones
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Supervise los registros de auditoría en vivo, verifique el estado de entrega de cada mensaje y consulte el historial de comunicaciones enviadas a los socios.
          </p>
        </div>
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl h-11 px-5 gap-2 shadow-lg shadow-primary/20 shrink-0"
        >
          <Link href="/settings/notifications">
            Abrir Centro de Control <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
