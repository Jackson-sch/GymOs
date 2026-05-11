"use client";

import React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, TrendingDown, Tag } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { createExpenseAction, deleteExpenseAction, createExpenseCategoryAction } from "@/lib/actions/expenses-actions";
import { Badge } from "@/components/ui/badge";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ExpenseForm from "@/components/shared/forms/ExpenseForm";
import CategoryForm from "@/components/shared/forms/CategoryForm";
import { formatCurrency, formatDate } from "@/lib/formats";

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
          {formatDate(new Date(row.original.date))}
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
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <ConfirmAction
            title="¿Eliminar gasto?"
            description={
              <>
                Esta acción no se puede deshacer. El registro del gasto por{" "}
                <span className="font-bold text-white">{formatCurrency(row.original.amount)}</span> será borrado permanentemente de la base de datos.
              </>
            }
            onConfirm={async () => {
              const res = await deleteExpenseAction(row.original.id);
              if (res.success) {
                toast.success("Gasto eliminado correctamente");
                setData(prev => prev.filter(e => e.id !== row.original.id));
              } else {
                toast.error(res.error || "Error al intentar eliminar el gasto");
              }
            }}
            confirmText="Confirmar Eliminación"
          >
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </ConfirmAction>
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
                {formatCurrency(totalExpenses)}
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
            <CategoryForm 
              catFormData={catFormData}
              setCatFormData={setCatFormData}
              handleCreateCategory={handleCreateCategory}
              isSaving={isSaving}
              setIsCatOpen={setIsCatOpen}
            />
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
            <ExpenseForm 
              formData={formData}
              setFormData={setFormData}
              catData={catData}
              handleCreateExpense={handleCreateExpense}
              isSaving={isSaving}
              setIsOpen={setIsOpen}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
          <DataTable 
            columns={columns} 
            data={data} 
            filterColumn="description" 
            placeholder="Buscar por descripción..."
            manualFiltering={false}
          />
        </div>
    </div>
  );
}
