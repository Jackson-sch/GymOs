"use client";

import React from "react";
import { 
  CreditCard, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Zap,
  Edit2,
  Trash2,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlanForm } from "@/components/shared/forms/PlanForm";
import { deletePlanAction } from "@/lib/actions/plans-actions";
import { toast } from "sonner";

export function MembershipsClient({ data }: { data: any[] }) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<any>(null);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este plan?")) {
      const result = await deletePlanAction(id);
      if (result.success) toast.success("Plan eliminado");
      else toast.error(result.error);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Actions */}
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">Definir Plan Maestro</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Crea una nueva oferta comercial para tus socios.
              </DialogDescription>
            </DialogHeader>
            <PlanForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.length > 0 ? (
          data.map((plan: any) => (
            <div key={plan.id} className="glass-card group relative flex flex-col p-8 border-white/5 overflow-hidden interactive-hover">
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card border-white/10 bg-black/90 backdrop-blur-xl">
                    <DropdownMenuItem 
                      className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 cursor-pointer"
                      onClick={() => setEditingPlan(plan)}
                    >
                      <Edit2 className="w-3 h-3" /> Editar Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-rose-500/20 text-rose-500 cursor-pointer"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex justify-between items-start mb-6">
                <Badge variant="outline" className="rounded-full bg-white/5 border-white/10 px-3 py-1 text-[10px] tracking-widest uppercase text-muted-foreground font-bold">
                  {plan.category}
                </Badge>
                {plan.allowedClasses && (
                  <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                )}
              </div>

              <div className="space-y-2 mb-8">
                <h3 className="text-3xl font-serif">{plan.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {plan.description || "Sin descripción disponible."}
                </p>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-sans font-light tracking-tighter">S/. {Number(plan.price).toFixed(2)}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">/ {plan.durationDays} días</span>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Duración: {plan.durationDays} días naturales</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{plan.allowedClasses ? "Acceso a clases grupales" : "Solo gimnasio"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Congelación: {plan.maxFreezeDays} días máx.</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full rounded-xl border-white/10 hover:bg-white/5 text-[10px] uppercase tracking-widest font-bold h-10 mt-auto">
                Ver Socios Activos
              </Button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center glass-card border-dashed border-white/10">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-serif text-xl text-muted-foreground">Aún no hay planes configurados.</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif">Editar Plan</DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
              Ajusta las condiciones de {editingPlan?.name}.
            </DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <PlanForm 
              initialData={editingPlan} 
              onSuccess={() => setEditingPlan(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
