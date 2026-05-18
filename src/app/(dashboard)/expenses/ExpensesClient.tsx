"use client";

import React, { useState, useMemo, type SyntheticEvent } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingDown, Tag } from "lucide-react";
import { toast } from "sonner";
import { createExpenseAction, createExpenseCategoryAction } from "@/lib/actions/expenses-actions";
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
import { formatCurrency } from "@/lib/formats";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { getColumns } from "./columns";
import { ExpenseCard } from "./components/ExpenseCard";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export function ExpensesClient({ expenses, categories }: { expenses: any[]; categories: any[] }) {
  const [data, setData] = useState(expenses);
  const [catData, setCatData] = useState(categories);
  const [isOpen, setIsOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [viewMode, setViewMode] = useQueryState(
    "view",
    parseAsStringLiteral(["list", "grid"]).withDefault("grid")
  );
  
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    categoryId: "",
    reference: "",
  });

  const [catFormData, setCatFormData] = useState({
    name: "",
    description: "",
  });

  const columns = useMemo(() => getColumns(setData), []);

  const filteredData = useMemo(() => {
    return data.filter(e => 
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.reference?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const handleCreateCategory = async (e: SyntheticEvent<HTMLFormElement>) => {
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

  const handleCreateExpense = async (e: SyntheticEvent<HTMLFormElement>) => {
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
  const currentMonthExpenses = data.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((acc, curr) => acc + Number(curr.amount), 0);

  const lastMonthExpenses = data.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return d.getMonth() === lastMonth && d.getFullYear() === year;
  }).reduce((acc, curr) => acc + Number(curr.amount), 0);

  const diff = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

  const topCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    data.forEach(e => {
      const name = e.category?.name || "General";
      cats[name] = (cats[name] || 0) + Number(e.amount);
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5 relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <TrendingDown className="size-5" />
              </div>
              <Badge variant="outline" className={cn(
                "text-[10px] font-bold border-none",
                diff > 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
              )}>
                {diff > 0 ? <ArrowUpRight className="size-3 mr-1" /> : <ArrowDownRight className="size-3 mr-1" />}
                {Math.abs(diff).toFixed(1)}%
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-light tracking-tighter text-foreground">
                {formatCurrency(currentMonthExpenses)}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Gastos este Mes
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Briefcase className="size-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-light tracking-tighter text-foreground">
                {topCategory ? formatCurrency(topCategory[1]) : "$0.00"}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Categoría Top: <span className="text-primary">{topCategory ? topCategory[0] : "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
                <CalendarIcon className="size-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-light tracking-tighter text-foreground">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Total Histórico
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "grid")} className="w-full md:w-auto">
            <TabsList className="bg-white/5 border border-white/10 p-1 h-11 rounded-xl">
              <TabsTrigger value="grid" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-9 px-4">
                <LayoutGrid className="size-4 mr-2" /> Cuadrícula
              </TabsTrigger>
              <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-9 px-4">
                <List className="size-4 mr-2" /> Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Buscar gasto o categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-10 rounded-xl border-border/10 bg-background/50 hover:bg-background/80">
              <Tag className="size-4 mr-2" /> Nueva Categoría
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
              <Plus className="size-4 mr-2" /> Registrar Gasto
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
        {viewMode === "list" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DataTable 
              columns={columns} 
              data={filteredData} 
              filterColumn="description" 
              placeholder="Buscar por descripción..."
              manualFiltering={false}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
            {filteredData.length > 0 ? (
              filteredData.map((expense) => (
                <ExpenseCard 
                  key={expense.id} 
                  expense={expense} 
                  onDelete={(id) => setData(prev => prev.filter(e => e.id !== id))} 
                />
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 glass-card bg-white/5 border-dashed border-white/10">
                <Filter className="size-12 text-muted-foreground opacity-20" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">No se encontraron egresos</p>
                  <p className="text-xs text-muted-foreground">Intenta ajustar tus criterios de búsqueda</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
