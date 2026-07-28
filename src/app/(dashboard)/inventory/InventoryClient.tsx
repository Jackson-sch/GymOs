"use client";

import React, { useState, useMemo } from "react";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Dumbbell,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EquipmentStatus } from "@prisma/client";
import { EquipmentForm } from "@/components/shared/forms/EquipmentForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { deleteEquipmentAction, updateEquipmentAction } from "@/lib/actions/inventory-actions";
import { MaintenanceSchedule } from "@/components/shared/MaintenanceSchedule";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { useQueryState, parseAsInteger } from "nuqs";
import Image from "next/image";
import { formatDate } from "@/lib/formats";
import { InventoryTabBar } from "./components/InventoryTabBar";
import { InventoryControlBar } from "./components/InventoryControlBar";
import { InventoryItemCard } from "./components/InventoryItemCard";

const getStatusInfo = (status: EquipmentStatus) => {
  switch (status) {
    case "OPERATIONAL":
      return {
        label: "Operativo",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/30",
        icon: CheckCircle2,
      };
    case "MAINTENANCE":
      return {
        label: "En Mantenimiento",
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/30",
        icon: Clock,
      };
    case "OUT_OF_SERVICE":
      return {
        label: "Fuera de Servicio",
        color: "text-rose-400",
        bg: "bg-rose-500/10 border-rose-500/30",
        icon: AlertTriangle,
      };
    default:
      return {
        label: "Desconocido",
        color: "text-muted-foreground",
        bg: "bg-muted/10 border-white/10",
        icon: Clock,
      };
  }
};

export function InventoryClient({ data }: { data: any[] }) {
  const [activeTab, setActiveTab] = useState<"EQUIPMENT" | "SCHEDULE" | "ALERTS">("EQUIPMENT");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination State
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(12));

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const now = useMemo(() => new Date(), []);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [servicingItem, setServicingItem] = useState<any>(null);
  const [isServicingLoading, setIsServicingLoading] = useState(false);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [data]);

  // Filtered equipment dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const query = search.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.serialNumber?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [data, search, statusFilter, categoryFilter]);

  // Paginated dataset
  const totalPages = Math.ceil(filteredData.length / (pageSize || 12));
  const paginatedData = useMemo(() => {
    const p = page || 1;
    const s = pageSize || 12;
    return filteredData.slice((p - 1) * s, p * s);
  }, [filteredData, page, pageSize]);

  // Overdue maintenance items
  const overdueItems = useMemo(() => {
    return data.filter((item) => {
      const isOverdue = item.nextMaintenance && new Date(item.nextMaintenance) < new Date();
      return isOverdue || item.status === "MAINTENANCE" || item.status === "OUT_OF_SERVICE";
    });
  }, [data]);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleteLoading(true);
    try {
      const res = await deleteEquipmentAction(deletingId);
      if (res.success) {
        toast.success("Equipo eliminado del inventario");
        setDeletingId(null);
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Error al eliminar el equipo");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleQuickService = async (item: any) => {
    setIsServicingLoading(true);
    try {
      const today = new Date();
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 90); // 90 days interval

      const res = await updateEquipmentAction(item.id, {
        ...item,
        status: "OPERATIONAL",
        lastMaintenance: today.toISOString(),
        nextMaintenance: nextDate.toISOString(),
      });

      if (res.success) {
        toast.success(`Mantenimiento registrado para ${item.name}`);
        setServicingItem(null);
      } else {
        toast.error(res.error || "Error al actualizar servicio");
      }
    } catch (error) {
      toast.error("Error de comunicación con el servidor");
    } finally {
      setIsServicingLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      <InventoryTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalItems={data.length}
        overdueCount={overdueItems.length}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {/* TAB 1: EQUIPMENT CATALOG */}
      {activeTab === "EQUIPMENT" && (
        <div className="space-y-6">
          <InventoryControlBar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Dynamic Category Pills */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <button type="button"
                onClick={() => {
                  setCategoryFilter("ALL");
                  setPage(1);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-colors shrink-0",
                  categoryFilter === "ALL"
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground",
                )}
              >
                Todas las Categorías
              </button>
              {categories.map((cat) => (
                <button type="button"
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setPage(1);
                  }}
                  className={cn(
                    "px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-colors shrink-0",
                    categoryFilter === cat
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedData.map((item) => {
                const status = getStatusInfo(item.status);
                const isOverdue = item.nextMaintenance && new Date(item.nextMaintenance) < now;

                return (
                  <InventoryItemCard
                    key={item.id}
                    item={item}
                    status={status}
                    isOverdue={!!isOverdue}
                    onEdit={setEditingItem}
                    onService={setServicingItem}
                    onDelete={setDeletingId}
                  />
                );
              })}
            </div>
          )}

          {/* LIST VIEW (Data Table) */}
          {viewMode === "list" && (
            <div className="glass-card border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-bold text-xs py-4">Equipo</TableHead>
                    <TableHead className="text-muted-foreground font-bold text-xs py-4">Categoría</TableHead>
                    <TableHead className="text-muted-foreground font-bold text-xs py-4">N° Serie</TableHead>
                    <TableHead className="text-muted-foreground font-bold text-xs py-4">Estado</TableHead>
                    <TableHead className="text-muted-foreground font-bold text-xs py-4">Último Mant.</TableHead>
                    <TableHead className="text-muted-foreground font-bold text-xs py-4">Próximo Mant.</TableHead>
                    <TableHead className="text-muted-foreground font-bold text-xs py-4 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => {
                    const status = getStatusInfo(item.status);
                    const isOverdue = item.nextMaintenance && new Date(item.nextMaintenance) < now;

                    return (
                      <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                              {item.photo ? (
                                <Image src={item.photo} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                              ) : (
                                <Dumbbell className="size-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {item.category}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.serialNumber || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase px-3 py-1", status.bg, status.color)}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {item.lastMaintenance ? formatDate(item.lastMaintenance) : "Pendiente"}
                        </TableCell>
                        <TableCell className={cn("text-xs font-mono font-semibold", isOverdue ? "text-rose-400" : "text-muted-foreground")}>
                          {item.nextMaintenance ? formatDate(item.nextMaintenance) : "No programado"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(item)}
                              className="h-8 w-8 p-0 rounded-lg border-white/10"
                            >
                              <Edit className="size-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setServicingItem(item)}
                              className="h-8 px-3 rounded-lg border-white/10 text-[10px] uppercase font-bold text-primary"
                            >
                              <Wrench className="size-3.5 mr-1" /> Servir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredData.length === 0 && (
            <div className="text-center py-16 glass-card rounded-3xl border-dashed border-white/10">
              <Dumbbell className="size-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <h3 className="text-xl font-serif text-foreground">No se encontraron equipos</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Pruebe ajustando los filtros de búsqueda o registre un nuevo equipo de gimnasio.
              </p>
            </div>
          )}

          {/* Numeric Pagination Bar */}
          <PaginationBar
            currentPage={page || 1}
            totalPages={totalPages}
            pageSize={pageSize || 12}
            totalItems={filteredData.length}
            onPageChange={(p: number) => setPage(p)}
            onPageSizeChange={(s: number) => setPageSize(s)}
            pageSizeOptions={[8, 12, 24, 48]}
            itemLabel="equipos"
          />
        </div>
      )}

      {/* TAB 2: SCHEDULE */}
      {activeTab === "SCHEDULE" && (
        <div className="glass-card p-8 rounded-3xl border-white/10">
          <div className="mb-6">
            <h3 className="text-2xl font-serif font-bold text-foreground">Cronograma de Mantenimientos Preventivos</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Supervisión de la frecuencia técnica de revisiones para mantener la flota operativa.
            </p>
          </div>
          <MaintenanceSchedule data={data} />
        </div>
      )}

      {/* TAB 3: ALERTS & INCIDENTS */}
      {activeTab === "ALERTS" && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border-rose-500/20 bg-rose-500/5">
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="size-6 text-rose-500 animate-pulse" />
              <h3 className="text-xl font-serif font-bold text-rose-400">Atención Técnica Requerida</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Equipos marcados fuera de servicio o con revisiones vencidas que requieren intervención urgente.
            </p>
          </div>

          <div className="glass-card border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-bold text-xs py-4">Equipo</TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs py-4">Categoría</TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs py-4">Estado Actual</TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs py-4">Fecha Programada</TableHead>
                  <TableHead className="text-muted-foreground font-bold text-xs py-4 text-right">Acción Urgente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueItems.map((item) => {
                  const status = getStatusInfo(item.status);
                  return (
                    <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="py-4 font-semibold text-foreground">{item.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[9px] font-bold uppercase px-3 py-1", status.bg, status.color)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-rose-400 font-semibold">
                        {item.nextMaintenance ? formatDate(item.nextMaintenance) : "Vencido"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => setServicingItem(item)}
                          className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
                        >
                          <Wrench className="size-3.5 mr-1.5" /> Marcar Reparado
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {overdueItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-emerald-400 text-xs font-semibold">
                      ¡Excelente! No hay equipos con alertas de mantenimiento vencidas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Equipment Create Modal */}
      {isCreateOpen && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="glass-card bg-zinc-950/95 border-white/10 sm:max-w-xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif text-foreground">Registrar Nuevo Equipo</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Añada una nueva máquina o accesorio al inventario del gimnasio.
              </DialogDescription>
            </DialogHeader>
            <EquipmentForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Equipment Edit Modal */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="glass-card bg-zinc-950/95 border-white/10 sm:max-w-xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif text-foreground">Editar Equipo</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Actualice los datos de {editingItem.name}.
              </DialogDescription>
            </DialogHeader>
            <EquipmentForm initialData={editingItem} onSuccess={() => setEditingItem(null)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Quick Service Modal */}
      {servicingItem && (
        <ConfirmDialog
          isOpen={!!servicingItem}
          onOpenChange={(v) => !v && setServicingItem(null)}
          onConfirm={() => handleQuickService(servicingItem)}
          title="Registrar Mantenimiento Realizado"
          description={`¿Confirmar que se ha completado el mantenimiento técnico de ${servicingItem.name}? Esto actualizará la fecha de última revisión a hoy y marcará el estado como Operativo.`}
          confirmText="Confirmar Servicio"
          cancelText="Cancelar"
          variant="primary"
          isLoading={isServicingLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onOpenChange={(v) => !v && setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Equipo"
        description="¿Estás seguro de que deseas eliminar este equipo del inventario? Esta acción no se puede deshacer."
        confirmText="Eliminar Equipo"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
