"use client";

import React, { useState, useTransition } from "react";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Search, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  ArrowLeft,
  Filter,
  MessageSquare,
  Sparkles,
  Send
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQueryState, parseAsString } from "nuqs";
import { getAllAppNotificationsAction, deleteNotificationAction } from "@/lib/actions/notification-actions";
import { formatDate, formatTime } from "@/lib/formats";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  memberId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string | Date;
  member?: {
    fullName: string;
    email: string | null;
    phone: string;
  };
}

export function NotificationsClient({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // nuqs query state for search and filter
  const [filterType, setFilterType] = useQueryState(
    "type", 
    parseAsString.withDefault("ALL").withOptions({ shallow: false })
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );

  const fetchNotifications = async (type = filterType, search = searchQuery) => {
    startTransition(async () => {
      const res = await getAllAppNotificationsAction(type, search);
      if (res.success && res.data) {
        setNotifications(res.data);
      } else {
        toast.error(res.error || "Error al actualizar notificaciones");
      }
    });
  };

  const handleFilterChange = (newType: string) => {
    setFilterType(newType);
    fetchNotifications(newType, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchNotifications(filterType, val);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await deleteNotificationAction(id);
    if (res.success) {
      toast.success("Notificación eliminada del registro");
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } else {
      toast.error(res.error || "Error al eliminar");
    }
    setDeletingId(null);
  };

  // Helper to determine icon
  const getIcon = (item: NotificationItem) => {
    const title = item.title?.toLowerCase() || "";
    if (title.includes("email") || title.includes("correo") || title.includes("bienvenida") || title.includes("membresía") || title.includes("recibo") || title.includes("pago") || title.includes("reserva")) {
      return { icon: Mail, bg: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Correo / Email" };
    }
    if (title.includes("whatsapp") || title.includes("sms")) {
      return { icon: Smartphone, bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Móvil / SMS" };
    }
    return { icon: Bell, bg: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "Sistema" };
  };

  // Helper for type badges
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return { label: "Éxito", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      case "WARNING":
        return { label: "Advertencia", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      case "ERROR":
        return { label: "Error", className: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
      default:
        return { label: "Informativo", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    }
  };

  // Calculate stats
  const totalCount = notifications.length;
  const emailsCount = notifications.filter(n => {
    const t = (n.title || "").toLowerCase();
    return t.includes("email") || t.includes("correo") || t.includes("bienvenida") || t.includes("membresía") || t.includes("recibo") || t.includes("pago") || t.includes("reserva");
  }).length;
  const smsCount = notifications.filter(n => {
    const t = (n.title || "").toLowerCase();
    return t.includes("sms") || t.includes("whatsapp");
  }).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border-white/10">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="rounded-2xl size-10 bg-white/5 border-white/10 hover:bg-white/10">
            <Link href="/settings?tab=notifications">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-serif tracking-tight">Centro de Control de Comunicaciones</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold uppercase">
                Auditoría Real
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 tracking-wide">
              Supervisión en tiempo real de correos electrónicos, SMS y alertas de sistema enviadas a los socios.
            </p>
          </div>
        </div>
        <Button 
          onClick={() => fetchNotifications()} 
          disabled={isPending}
          variant="outline" 
          className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase text-[10px] tracking-wider flex items-center gap-2 shadow-lg h-10"
        >
          <RefreshCw className={cn("size-4 text-primary", isPending && "animate-spin")} />
          Sincronizar Datos
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <Send className="size-16 text-primary" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="size-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
              <MessageSquare className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Mensajes</p>
              <h3 className="text-3xl font-serif font-bold mt-0.5">{totalCount}</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>100% procesado correctamente</span>
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <Mail className="size-16 text-blue-400" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="size-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Mail className="size-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Correos / Emails</p>
              <h3 className="text-3xl font-serif font-bold mt-0.5">{emailsCount}</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-4 text-blue-400" />
            <span>Mensajes de bienvenida y estados</span>
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <Smartphone className="size-16 text-emerald-400" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="size-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Smartphone className="size-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Móvil / WhatsApp</p>
              <h3 className="text-3xl font-serif font-bold mt-0.5">{smsCount}</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Alertas de vencimiento enviadas</span>
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-3xl border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <Filter className="size-4 text-muted-foreground ml-2 hidden sm:block" />
          {[
            { id: "ALL", label: "Todas" },
            { id: "INFO", label: "Informativas" },
            { id: "SUCCESS", label: "Éxito" },
            { id: "WARNING", label: "Avisos" },
            { id: "ERROR", label: "Errores" }
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              variant={filterType === tab.id ? "default" : "ghost"}
              className={cn(
                "rounded-xl px-4 h-9 uppercase tracking-wider text-[10px] font-bold transition-all whitespace-nowrap",
                filterType === tab.id ? "shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre de socio..."
            className="pl-10 h-10 rounded-2xl bg-white/5 border-white/10 text-sm tracking-wide focus-visible:ring-primary/50"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isPending && notifications.length === 0 ? (
          <div className="glass-card p-16 rounded-3xl border-white/10 flex flex-col items-center justify-center text-center">
            <RefreshCw className="size-10 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-serif">Sincronizando comunicaciones...</h3>
            <p className="text-xs text-muted-foreground mt-1">Conectando con los registros de la base de datos</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-16 rounded-3xl border-white/10 flex flex-col items-center justify-center text-center">
            <div className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-muted-foreground">
              <Bell className="size-8 opacity-50" />
            </div>
            <h3 className="text-xl font-serif">No se encontraron notificaciones</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {searchQuery || filterType !== "ALL" 
                ? "Ningún registro coincide con los criterios de búsqueda o filtrado actuales."
                : "Aún no se han registrado envíos de correos, SMS o alertas automáticas en el sistema."}
            </p>
            {(searchQuery || filterType !== "ALL") && (
              <Button 
                onClick={() => { setSearchQuery(""); setFilterType("ALL"); fetchNotifications("ALL", ""); }}
                variant="outline" 
                className="mt-6 rounded-xl text-xs uppercase tracking-wider font-bold"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        ) : (
          notifications.map((item) => {
            const { icon: Icon, bg, label } = getIcon(item);
            const badge = getTypeBadge(item.type);

            return (
              <div 
                key={item.id}
                className="glass-card p-6 rounded-3xl border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/5 transition-colors duration-300 group"
              >
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* Channel Icon */}
                  <div className={cn("size-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg", bg)}>
                    <Icon className="size-6" />
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider", badge.className)}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                        • {label}
                      </span>
                    </div>

                    <h4 className="text-base font-medium text-foreground tracking-wide">{item.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.message}</p>

                    {/* Recipient Member */}
                    {item.member && (
                      <div className="flex items-center gap-2 pt-1">
                        <Avatar className="size-5 border border-white/20">
                          <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-bold">
                            {item.member.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-foreground">{item.member.fullName}</span>
                        <span className="text-xs text-muted-foreground">• {item.member.email || item.member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-semibold text-foreground">{formatDate(item.createdAt)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">{formatTime(item.createdAt)}</p>
                  </div>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    variant="ghost"
                    size="icon"
                    className="rounded-xl size-9 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Eliminar registro"
                  >
                    <Trash2 className={cn("size-4", deletingId === item.id && "animate-spin")} />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
