"use client";

import React, { useState, useTransition, useMemo } from "react";
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
  Send,
  Eye,
  LayoutList,
  Grid,
  User,
  ArrowUpDown,
} from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQueryState, parseAsString } from "nuqs";
import {
  getAllAppNotificationsAction,
  deleteNotificationAction,
} from "@/lib/actions/notification-actions";
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

export function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications: NotificationItem[];
}) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // View Mode: "table" (TanStack Data-Grid) or "cards"
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Selected Notification for Detail Dialog Inspection
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  // TanStack Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // nuqs query state for search and filter
  const [filterType, setFilterType] = useQueryState(
    "type",
    parseAsString.withDefault("ALL").withOptions({ shallow: false }),
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: false }),
  );

  const fetchNotifications = async (
    type = filterType,
    search = searchQuery,
  ) => {
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

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingId(id);
    const res = await deleteNotificationAction(id);
    if (res.success) {
      toast.success("Notificación eliminada del registro");
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
    } else {
      toast.error(res.error || "Error al eliminar");
    }
    setDeletingId(null);
  };

  // Helper to determine icon
  const getIcon = (item: NotificationItem) => {
    const title = item.title?.toLowerCase() || "";
    if (
      title.includes("email") ||
      title.includes("correo") ||
      title.includes("bienvenida") ||
      title.includes("membresía") ||
      title.includes("recibo") ||
      title.includes("pago") ||
      title.includes("reserva")
    ) {
      return {
        icon: Mail,
        bg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        label: "Correo / Email",
      };
    }
    if (title.includes("whatsapp") || title.includes("sms")) {
      return {
        icon: Smartphone,
        bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        label: "Móvil / WhatsApp",
      };
    }
    return {
      icon: Bell,
      bg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      label: "Sistema",
    };
  };

  // Helper for type badges
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return {
          label: "Éxito",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
      case "WARNING":
        return {
          label: "Aviso",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
      case "ERROR":
        return {
          label: "Error",
          className: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        };
      default:
        return {
          label: "Info",
          className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        };
    }
  };

  // Define TanStack Columns
  const columns = useMemo<ColumnDef<NotificationItem>[]>(
    () => [
      {
        accessorKey: "type",
        header: "Canal / Tipo",
        cell: ({ row }) => {
          const item = row.original;
          const { icon: Icon, bg, label } = getIcon(item);
          return (
            <div className="flex items-center gap-2.5 py-1">
              <div
                className={cn(
                  "size-8 rounded-xl border flex items-center justify-center shrink-0 shadow-sm",
                  bg,
                )}
              >
                <Icon className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground tracking-wide">
                {label}
              </span>
            </div>
          );
        },
      },
      {
        id: "recipient",
        header: "Socio / Destinatario",
        cell: ({ row }) => {
          const member = row.original.member;
          return member ? (
            <div className="flex items-center gap-2.5">
              <Avatar className="size-7 border border-white/10">
                <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                  {member.fullName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {member.fullName}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {member.email || member.phone}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Sistema General
            </span>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Asunto & Mensaje",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="max-w-xs">
              <p className="text-xs font-semibold text-foreground truncate">
                {item.title}
              </p>
              <p className="text-[11px] text-muted-foreground truncate font-sans">
                {item.message}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "type_status",
        header: "Estado",
        cell: ({ row }) => {
          const badge = getTypeBadge(row.original.type);
          return (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold py-0.5 px-2.5",
                badge.className,
              )}
            >
              {badge.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer select-none"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha & Hora
            <ArrowUpDown className="size-3 opacity-60" />
          </div>
        ),
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-xs">
                {formatDate(date)}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {formatTime(date)}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right pr-4">Acciones</div>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5 pr-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNotification(item);
                }}
                className="size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="Ver contenido completo"
              >
                <Eye className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleDelete(item.id, e)}
                disabled={deletingId === item.id}
                className="size-8 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                title="Eliminar notificación"
              >
                <Trash2
                  className={cn(
                    "size-3.5",
                    deletingId === item.id && "animate-spin",
                  )}
                />
              </Button>
            </div>
          );
        },
      },
    ],
    [deletingId],
  );

  // TanStack Table Instance
  const table = useReactTable({
    data: notifications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
    },
  });

  // Calculate stats
  const totalCount = notifications.length;
  const emailsCount = notifications.filter((n) => {
    const t = (n.title || "").toLowerCase();
    return (
      t.includes("email") ||
      t.includes("correo") ||
      t.includes("bienvenida") ||
      t.includes("membresía") ||
      t.includes("recibo") ||
      t.includes("pago") ||
      t.includes("reserva")
    );
  }).length;
  const smsCount = notifications.filter((n) => {
    const t = (n.title || "").toLowerCase();
    return t.includes("sms") || t.includes("whatsapp");
  }).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border-white/10">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="rounded-2xl size-10 bg-white/5 border-white/10 hover:bg-white/10"
          >
            <Link href="/settings?tab=notifications">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-serif tracking-tight">
                Centro de Control de Comunicaciones
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold uppercase">
                TanStack Data-Grid v8
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 tracking-wide">
              Supervisión en tiempo real de correos electrónicos, SMS y alertas de sistema enviadas a los socios.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => fetchNotifications()}
            disabled={isPending}
            variant="outline"
            className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase text-[10px] tracking-wider flex items-center gap-2 shadow-lg h-10"
          >
            <RefreshCw
              className={cn("size-4 text-primary", isPending && "animate-spin")}
            />
            Sincronizar Datos
          </Button>
        </div>
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Total Mensajes
              </p>
              <h3 className="text-3xl font-serif font-bold mt-0.5">
                {totalCount}
              </h3>
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Correos / Emails
              </p>
              <h3 className="text-3xl font-serif font-bold mt-0.5">
                {emailsCount}
              </h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-4 text-blue-400" />
            <span>Bienvenida, pagos y facturas</span>
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Móvil / WhatsApp
              </p>
              <h3 className="text-3xl font-serif font-bold mt-0.5">
                {smsCount}
              </h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Alertas de vencimiento enviadas</span>
          </p>
        </div>
      </div>

      {/* Filter & Search Bar + View Mode Toggle */}
      <div className="glass-card p-4 rounded-3xl border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <Filter className="size-4 text-muted-foreground ml-2 hidden sm:block" />
          {[
            { id: "ALL", label: "Todas" },
            { id: "INFO", label: "Informativas" },
            { id: "SUCCESS", label: "Éxito" },
            { id: "WARNING", label: "Avisos" },
            { id: "ERROR", label: "Errores" },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              variant={filterType === tab.id ? "default" : "ghost"}
              className={cn(
                "rounded-xl px-4 h-9 uppercase tracking-wider text-[10px] font-bold transition-all whitespace-nowrap",
                filterType === tab.id
                  ? "shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre de socio..."
              className="pl-10 h-10 rounded-2xl bg-white/5 border-white/10 text-xs tracking-wide focus-visible:ring-primary/50"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 shrink-0">
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => setViewMode("table")}
              className="h-8 px-2.5 rounded-lg text-xs gap-1.5 font-bold"
              title="TanStack Table (Data-Grid)"
            >
              <LayoutList className="size-3.5" />
              <span className="hidden sm:inline">Tabla (TanStack)</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "cards" ? "default" : "ghost"}
              onClick={() => setViewMode("cards")}
              className="h-8 px-2.5 rounded-lg text-xs gap-1.5 font-bold"
              title="Vista de Tarjetas"
            >
              <Grid className="size-3.5" />
              <span className="hidden sm:inline">Tarjetas</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isPending && notifications.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl border-white/10 flex flex-col items-center justify-center text-center">
          <RefreshCw className="size-10 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-serif">Sincronizando notificaciones...</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Conectando con la base de datos de GymOS
          </p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl border-white/10 flex flex-col items-center justify-center text-center">
          <div className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-muted-foreground">
            <Bell className="size-8 opacity-50" />
          </div>
          <h3 className="text-xl font-serif">No se encontraron registros</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery || filterType !== "ALL"
              ? "Ningún registro coincide con los criterios de búsqueda actuales."
              : "Aún no se han registrado envíos de correos o alertas automáticas."}
          </p>
          {(searchQuery || filterType !== "ALL") && (
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterType("ALL");
                fetchNotifications("ALL", "");
              }}
              variant="outline"
              className="mt-6 rounded-xl text-xs uppercase tracking-wider font-bold"
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TANSTACK TABLE V8 DATA-GRID VIEW */
        <div className="space-y-4">
          <div className="glass-card border-white/10 overflow-hidden shadow-2xl backdrop-blur-md rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <React.Fragment key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-muted-foreground"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </th>
                        ))}
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedNotification(row.original)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-3.5 text-xs font-sans">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TanStack Native Pagination Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-white/5 bg-white/2 gap-4">
              <div className="text-xs text-muted-foreground font-medium">
                Página{" "}
                <span className="font-bold text-foreground font-mono">
                  {table.getState().pagination.pageIndex + 1}
                </span>{" "}
                de{" "}
                <span className="font-bold text-foreground font-mono">
                  {table.getPageCount()}
                </span>{" "}
                • {notifications.length} registros totales
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 text-xs font-bold rounded-lg border-white/10"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 text-xs font-bold rounded-lg border-white/10"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CARDS VIEW (ALTERNATIVE) */
        <div className="space-y-4">
          <div className="space-y-4">
            {table.getRowModel().rows.map((row) => {
              const item = row.original;
              const { icon: Icon, bg, label } = getIcon(item);
              const badge = getTypeBadge(item.type);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedNotification(item)}
                  className="glass-card p-6 rounded-3xl border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/5 transition-colors duration-300 group cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div
                      className={cn(
                        "size-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg",
                        bg,
                      )}
                    >
                      <Icon className="size-6" />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                            badge.className,
                          )}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                          • {label}
                        </span>
                      </div>

                      <h4 className="text-base font-medium text-foreground tracking-wide">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      {item.member && (
                        <div className="flex items-center gap-2 pt-1">
                          <Avatar className="size-5 border border-white/20">
                            <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-bold">
                              {item.member.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground">
                            {item.member.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {item.member.email || item.member.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="text-left md:text-right">
                      <p className="text-xs font-semibold text-foreground">
                        {formatDate(item.createdAt)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={deletingId === item.id}
                      variant="ghost"
                      size="icon"
                      className="rounded-xl size-9 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2
                        className={cn(
                          "size-4",
                          deletingId === item.id && "animate-spin",
                        )}
                      />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* DIALOG FOR NOTIFICATION DETAIL INSPECTION */}
      {/* ========================================== */}
      <Dialog
        open={!!selectedNotification}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent className="bg-background/95 backdrop-blur-2xl border-white/10 text-foreground max-w-lg">
          {selectedNotification && (
            <>
              <DialogHeader className="space-y-2 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-10 rounded-2xl border flex items-center justify-center shadow-lg",
                      getIcon(selectedNotification).bg,
                    )}
                  >
                    {React.createElement(getIcon(selectedNotification).icon, {
                      className: "size-5",
                    })}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-serif text-foreground">
                      {selectedNotification.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{getIcon(selectedNotification).label}</span>
                      <span>•</span>
                      <span>{formatDate(selectedNotification.createdAt)}</span>
                      <span>{formatTime(selectedNotification.createdAt)}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Recipient Details */}
                {selectedNotification.member && (
                  <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                      <User className="size-3.5" /> Destinatario / Socio
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 border border-white/10">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                          {selectedNotification.member.fullName
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {selectedNotification.member.fullName}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {selectedNotification.member.email ||
                            selectedNotification.member.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Message Body */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Cuerpo Completo del Mensaje
                  </span>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs leading-relaxed text-foreground font-sans whitespace-pre-wrap">
                    {selectedNotification.message}
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-white/10 pt-4 flex flex-row items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDelete(selectedNotification.id)}
                  disabled={deletingId === selectedNotification.id}
                  className="text-rose-400 hover:bg-rose-500/10 text-xs uppercase font-bold"
                >
                  Eliminar Registro
                </Button>
                <Button
                  onClick={() => setSelectedNotification(null)}
                  className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
