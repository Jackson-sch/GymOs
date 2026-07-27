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
  Briefcase,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import { DateRangePicker } from "@/components/shared/DateRangePicker";

export function ExpensesClient({ expenses, categories }: { expenses: any[]; categories: any[] }) {
  const [data, setData] = useState(expenses);
  const [catData, setCatData] = useState(categories);
  const [isOpen, setIsOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  const [viewMode, setViewMode] = useQueryState(
    "view",
    parseAsStringLiteral(["list", "grid"]).withDefault("grid"),
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
    return data.filter((e) => {
      const query = search.toLowerCase();
      const matchesSearch =
        e.description?.toLowerCase().includes(query) ||
        e.category?.name?.toLowerCase().includes(query) ||
        e.reference?.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "ALL" || e.category?.id === selectedCategory || e.category?.name === selectedCategory;

      let matchesDate = true;
      if (e.date) {
        const expenseDate = new Date(e.date);
        if (dateFrom) {
          const fromD = new Date(`${dateFrom}T00:00:00`);
          if (expenseDate < fromD) matchesDate = false;
        }
        if (dateTo) {
          const toD = new Date(`${dateTo}T23:59:59`);
          if (expenseDate > toD) matchesDate = false;
        }
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [data, search, selectedCategory, dateFrom, dateTo]);

  const handleCreateCategory = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await createExpenseCategoryAction(catFormData);
      if (res.success) {
        toast.success("Categoría creada con éxito");
        setCatData((prev) => [...prev, res.data]);
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
      toast.error("Selecciona una categoría para el egreso");
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
        setData((prev) => [res.data, ...prev]);
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
  const currentMonthExpenses = data
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const lastMonthExpenses = data
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return d.getMonth() === lastMonth && d.getFullYear() === year;
    })
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const diff = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

  const topCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    data.forEach((e) => {
      const name = e.category?.name || "General";
      cats[name] = (cats[name] || 0) + Number(e.amount);
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  }, [data]);

  return (
    <div className="space-y-8 w-full">
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5 relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <TrendingDown className="size-5" />
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-bold border-none",
                  diff > 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500",
                )}
              >
                {diff > 0 ? <ArrowUpRight className="size-3 mr-1" /> : <ArrowDownRight className="size-3 mr-1" />}
                {Math.abs(diff).toFixed(1)}% vs mes anterior
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-serif font-bold text-foreground">
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
              <div className="text-3xl font-serif font-bold text-foreground">
                {topCategory ? formatCurrency(topCategory[1]) : "$0.00"}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Categoría Mayor Gasto: <span className="text-primary font-bold">{topCategory ? topCategory[0] : "N/A"}</span>
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
              <div className="text-3xl font-serif font-bold text-foreground">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Total Histórico Registrado
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Single Search + View Switcher + Action Dialogs */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
        <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
          {/* View Switcher Tabs */}
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "list" | "grid")}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-black/40 border border-white/10 p-1 h-11 rounded-2xl">
              <TabsTrigger
                value="grid"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-9 px-4 text-xs font-bold"
              >
                <LayoutGrid className="size-3.5 mr-2" /> Cuadrícula
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-9 px-4 text-xs font-bold"
              >
                <List className="size-3.5 mr-2" /> Tabla Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* SINGLE UNIFIED SEARCH INPUT & DATE RANGE */}
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por descripción, categoría o referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl text-xs focus-visible:ring-primary/30 transition-all"
            />
          </div>

          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onSelectRange={({ from, to }) => {
              setDateFrom(from);
              setDateTo(to);
            }}
            placeholder="Filtrar por fechas"
            showPresets={false}
            align="start"
          />
        </div>

        {/* Action Dialog Triggers */}
        <div className="flex items-center gap-3 shrink-0">
          <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Tag className="size-3.5 mr-2 text-primary" /> Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Nueva Categoría</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Crea una categoría para clasificar los egresos (Ej. Mantenimiento, Planilla, Servicios).
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
              <Button className="h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Plus className="size-4 mr-2" /> Registrar Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Registrar Nuevo Gasto</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Ingresa los detalles del egreso operativo o caja chica.
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
      </div>

      {/* Category Pills Filter */}
      {catData.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={cn(
              "px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-all shrink-0",
              selectedCategory === "ALL"
                ? "bg-white text-black border-white shadow-sm"
                : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground",
            )}
          >
            Todas las Categorías
          </button>
          {catData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-all shrink-0",
                selectedCategory === cat.id
                  ? "bg-white text-black border-white shadow-sm"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Data Views */}
      <div className="space-y-6">
        {viewMode === "list" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* SINGLE TABLE VIEW - showSearchInput={false} suppresses duplicate inner search bar */}
            <DataTable
              columns={columns}
              data={filteredData}
              showSearchInput={false}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
            {filteredData.length > 0 ? (
              filteredData.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onDelete={(id) => setData((prev) => prev.filter((e) => e.id !== id))}
                />
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 glass-card bg-white/5 border-dashed border-white/10 rounded-3xl">
                <Filter className="size-12 text-muted-foreground opacity-20" />
                <div className="space-y-1">
                  <p className="text-base font-serif font-bold text-foreground">No se encontraron egresos</p>
                  <p className="text-xs text-muted-foreground">Intente ajustando sus criterios o filtros de búsqueda</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
