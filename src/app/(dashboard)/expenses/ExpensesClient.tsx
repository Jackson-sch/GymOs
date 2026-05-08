"use client";

import React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, TrendingDown, Tag, Save, Activity } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { createExpenseAction, deleteExpenseAction, createExpenseCategoryAction } from "@/lib/actions/expenses-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ExpensesClient({ expenses, categories }: { expenses: any[]; categories: any[] }) {
  const [data, setData] = React.useState(expenses);
  const [catData, setCatData] = React.useState(categories);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCatOpen, setIsCatOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    amount: "",
    description: "",
    categoryId: "",
    reference: "",
  });

  const [catFormData, setCatFormData] = React.useState({
    name: "",
    description: "",
  });

  const columns = [
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }: any) => (
        <span className="font-medium text-muted-foreground">
          {format(new Date(row.original.date), "dd MMM, yyyy", { locale: es })}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }: any) => (
        <span className="font-medium text-foreground">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }: any) => {
        const cat = row.original.category;
        return (
          <Badge variant="outline" className="border-border/20 text-muted-foreground">
            {cat?.name || "Sin categoría"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }: any) => (
        <span className="font-mono font-bold text-destructive">
          - S/ {Number(row.original.amount).toFixed(2)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={async () => {
              if (confirm("¿Estás seguro de eliminar este gasto?")) {
                const res = await deleteExpenseAction(row.original.id);
                if (res.success) {
                  toast.success("Gasto eliminado");
                  setData(prev => prev.filter(e => e.id !== row.original.id));
                } else {
                  toast.error(res.error || "Error al eliminar");
                }
              }
            }}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        );
      },
    },
  ];

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await createExpenseCategoryAction(catFormData);
      if (res.success) {
        toast.success("Categoría creada");
        setCatData(prev => [...prev, res.data]);
        setCatFormData({ name: "", description: "" });
        setIsCatOpen(false);
      } else {
        toast.error(res.error || "Error al crear categoría");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error("Selecciona una categoría");
      return;
    }
    setIsSaving(true);
    try {
      const res = await createExpenseAction({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      if (res.success) {
        toast.success("Gasto registrado exitosamente");
        setData(prev => [res.data, ...prev]);
        setFormData({ amount: "", description: "", categoryId: "", reference: "" });
        setIsOpen(false);
      } else {
        toast.error(res.error || "Error al registrar gasto");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const totalExpenses = data.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-destructive/5 border-destructive/20 shadow-sm overflow-hidden border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-light tracking-tighter text-destructive">
                S/ {totalExpenses.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold text-destructive/80 uppercase tracking-[0.2em]">
                Total Gastos Registrados
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-10 rounded-xl border-border/10 bg-background/50 hover:bg-background/80">
              <Tag className="w-4 h-4 mr-2" /> Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Nueva Categoría</DialogTitle>
              <DialogDescription>
                Crea una categoría para clasificar los gastos (Ej. Mantenimiento, Planilla, Servicios).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label>Nombre de la Categoría</Label>
                <Input 
                  required
                  value={catFormData.name}
                  onChange={e => setCatFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background/50 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción (Opcional)</Label>
                <Input 
                  value={catFormData.description}
                  onChange={e => setCatFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-background/50 border-white/10"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setIsCatOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground">
                  {isSaving ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Categoría
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Registrar Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Registrar Nuevo Gasto</DialogTitle>
              <DialogDescription>
                Ingresa los detalles del gasto operativo o caja chica.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateExpense} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monto (S/)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="bg-background/50 border-white/10 text-xl font-mono"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={v => setFormData(prev => ({ ...prev, categoryId: v }))}
                  >
                    <SelectTrigger className="bg-background/50 border-white/10 h-11">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catData.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción del Gasto</Label>
                <Input 
                  required
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-background/50 border-white/10"
                  placeholder="Ej. Pago recibo de luz"
                />
              </div>
              <div className="space-y-2">
                <Label>N° Comprobante / Referencia (Opcional)</Label>
                <Input 
                  value={formData.reference}
                  onChange={e => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  className="bg-background/50 border-white/10"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground">
                  {isSaving ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Registrar Gasto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/10 shadow-2xl bg-secondary/20 backdrop-blur-xl">
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={data} 
            filterColumn="description" 
            placeholder="Buscar por descripción..."
            manualFiltering={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
