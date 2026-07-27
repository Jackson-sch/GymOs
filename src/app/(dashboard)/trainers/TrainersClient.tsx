"use client";

import React, { useState, useMemo } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  User,
  ShieldCheck,
  ShieldAlert,
  Award,
  DollarSign,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrainerForm } from "@/components/shared/forms/TrainerForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { useQueryState, parseAsInteger } from "nuqs";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function TrainersClient({ data }: { data: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination state
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(12));

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // Extract unique specialties
  const specialties = useMemo(() => {
    const set = new Set<string>();
    data.forEach((trainer) => {
      (trainer.specialties || []).forEach((spec: string) => {
        if (spec) set.add(spec);
      });
    });
    return Array.from(set);
  }, [data]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((t) => {
      const query = search.toLowerCase();
      const matchesSearch =
        t.fullName.toLowerCase().includes(query) ||
        t.email?.toLowerCase().includes(query) ||
        t.phone?.toLowerCase().includes(query);

      const matchesSpecialty =
        selectedSpecialty === "ALL" ||
        (t.specialties || []).some((s: string) => s.toLowerCase() === selectedSpecialty.toLowerCase());

      return matchesSearch && matchesSpecialty;
    });
  }, [data, search, selectedSpecialty]);

  // Paginated dataset
  const totalPages = Math.ceil(filteredData.length / (pageSize || 12));
  const paginatedData = useMemo(() => {
    const p = page || 1;
    const s = pageSize || 12;
    return filteredData.slice((p - 1) * s, p * s);
  }, [filteredData, page, pageSize]);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleteLoading(true);
    try {
      const res = await fetch(`/api/trainers?id=${deletingId}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast.success("Entrenador eliminado");
        setDeletingId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al intentar eliminar el entrenador");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: setEditingTrainer,
        onDelete: (id: string) => setDeletingId(id),
      }),
    [],
  );

  return (
    <div className="space-y-8 w-full">
      {/* Action & Filter Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
        <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
          {/* Unified Search Bar */}
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl text-xs focus-visible:ring-primary/30 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end shrink-0">
          {/* View Switcher */}
          <div className="flex p-1 bg-black/40 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-xl text-xs transition-all",
                viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              title="Vista Cuadrícula"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-xl text-xs transition-all",
                viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              title="Vista Tabla Lista"
            >
              <List className="size-4" />
            </button>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Plus className="size-4 mr-2" /> Nuevo Entrenador
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">Staff Técnico</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Añade un nuevo instructor o profesional al equipo.
                </DialogDescription>
              </DialogHeader>
              <TrainerForm
                onSuccess={() => {
                  setIsCreateOpen(false);
                  toast.success("Entrenador creado correctamente");
                  router.refresh();
                }}
                onCancel={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Specialty Filter Pills */}
      {specialties.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => {
              setSelectedSpecialty("ALL");
              setPage(1);
            }}
            className={cn(
              "px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-all shrink-0",
              selectedSpecialty === "ALL"
                ? "bg-white text-black border-white shadow-sm"
                : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground",
            )}
          >
            Todas las Especialidades
          </button>
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => {
                setSelectedSpecialty(spec);
                setPage(1);
              }}
              className={cn(
                "px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-all shrink-0",
                selectedSpecialty === spec
                  ? "bg-white text-black border-white shadow-sm"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground",
              )}
            >
              {spec}
            </button>
          ))}
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedData.map((trainer) => (
            <Card
              key={trainer.id}
              className="glass-card border-white/10 rounded-3xl overflow-hidden hover:border-primary/30 transition-all group backdrop-blur-md"
            >
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg overflow-hidden relative shrink-0">
                      {trainer.photo ? (
                        <Image
                          src={trainer.photo}
                          alt={trainer.fullName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        trainer.fullName.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                        {trainer.fullName}
                      </h3>
                      <p className="text-xs text-muted-foreground font-sans flex items-center gap-1.5 mt-0.5">
                        <Mail className="size-3 text-primary/60" /> {trainer.email || "Sin email"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-bold uppercase px-2.5 py-1",
                      trainer.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
                    )}
                  >
                    {trainer.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5">
                  {(trainer.specialties || ["Musculación"]).map((spec: string) => (
                    <Badge
                      key={spec}
                      variant="outline"
                      className="bg-white/5 border-white/10 text-[9px] font-bold text-muted-foreground uppercase"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 bg-black/30 p-3.5 rounded-2xl border border-white/5 text-xs">
                  <div>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Base Salario</p>
                    <p className="font-serif font-bold text-foreground mt-0.5">
                      {trainer.baseSalary ? `S/ ${Number(trainer.baseSalary).toFixed(2)}` : "Comisión"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Comisión</p>
                    <p className="font-serif font-bold text-primary mt-0.5">
                      {trainer.commissionPct ? `${trainer.commissionPct}%` : "10% Standard"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Phone className="size-3 text-primary" /> {trainer.phone || "S/D"}
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-primary"
                  >
                    <Link href={`/trainers/${trainer.id}`}>
                      Ver Expediente <ExternalLink className="size-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* LIST VIEW (Data Table without duplicate search input) */}
      {viewMode === "list" && (
        <div className="glass-card border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
          <DataTable columns={columns} data={filteredData} showSearchInput={false} />
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
        itemLabel="entrenadores"
      />

      {/* Edit Modal */}
      {editingTrainer && (
        <Dialog open={!!editingTrainer} onOpenChange={(open) => !open && setEditingTrainer(null)}>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">Editar Perfil</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Actualiza la información técnica de {editingTrainer.fullName}.
              </DialogDescription>
            </DialogHeader>
            <TrainerForm
              trainer={editingTrainer}
              onSuccess={() => {
                setEditingTrainer(null);
                toast.success("Entrenador actualizado");
                router.refresh();
              }}
              onCancel={() => setEditingTrainer(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Entrenador"
        description="¿Estás seguro de eliminar este entrenador? Esta acción no se puede deshacer y borrará permanentemente sus datos y asignaciones."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleteLoading}
      />
    </div>
  );
}