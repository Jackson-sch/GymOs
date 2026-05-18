"use client";

import React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrainerForm } from "@/components/shared/forms/TrainerForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getColumns } from "./columns";

export function TrainersClient({ data }: { data: any[] }) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingTrainer, setEditingTrainer] = React.useState<any>(null);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este entrenador?")) {
      const res = await fetch(`/api/trainers?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast.success("Entrenador eliminado");
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    }
  };

  const columns = React.useMemo(() => getColumns({
    onEdit: setEditingTrainer,
    onDelete: handleDelete
  }), []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2">
              <Plus className="size-5" />
              Nuevo Entrenador
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">Staff Técnico</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Añade un nuevo instructor al equipo.
              </DialogDescription>
            </DialogHeader>
            <TrainerForm
              onSuccess={() => {
                setIsCreateOpen(false);
                toast.success("Entrenador creado");
                router.refresh();
              }}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={data} filterColumn="fullName" placeholder="Buscar entrenador..." />
      
      {editingTrainer && (
        <Dialog open={!!editingTrainer} onOpenChange={(open) => !open && setEditingTrainer(null)}>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">Editar Perfil</DialogTitle>
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
    </div>
  );
}