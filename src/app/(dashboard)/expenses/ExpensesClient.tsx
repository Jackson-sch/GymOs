"use client";

import React, { useState, useMemo, type SyntheticEvent } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Filter } from "lucide-react";
import { toast } from "sonner";
import { createExpenseAction, createExpenseCategoryAction } from "@/lib/actions/expenses-actions";
import { useQueryState, parseAsStringLiteral } from "nuqs";

import { getColumns } from "./columns";
import { ExpenseCard } from "./components/ExpenseCard";
import { ExpenseStatsCards } from "./components/ExpenseStatsCards";
import { ExpenseControlBar } from "./components/ExpenseControlBar";
import { CategoryPillsFilter } from "./components/CategoryPillsFilter";

export function ExpensesClient({ expenses, categories }: { expenses: any[]; categories: any[] }) {
  // eslint-disable-next-line react-doctor/no-derived-useState
  const [data, setData] = useState(expenses);
  // eslint-disable-next-line react-doctor/no-derived-useState
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
      <ExpenseStatsCards
        currentMonthExpenses={currentMonthExpenses}
        totalExpenses={totalExpenses}
        diff={diff}
        topCategory={topCategory}
      />

      <ExpenseControlBar
        viewMode={viewMode}
        onViewModeChange={(v) => setViewMode(v as "list" | "grid")}
        search={search}
        onSearchChange={setSearch}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateRangeChange={({ from, to }) => {
          setDateFrom(from);
          setDateTo(to);
        }}
        isCatOpen={isCatOpen}
        onCatOpenChange={setIsCatOpen}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        catFormData={catFormData}
        onCatFormDataChange={setCatFormData}
        handleCreateCategory={handleCreateCategory}
        isSaving={isSaving}
        onCatClose={() => setIsCatOpen(false)}
        formData={formData}
        onFormDataChange={setFormData}
        catData={catData}
        handleCreateExpense={handleCreateExpense}
        onExpenseClose={() => setIsOpen(false)}
      />

      <CategoryPillsFilter
        categories={catData}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Data Views */}
      <div className="space-y-6">
        {viewMode === "list" ? (
          <div className="animate-enter-fast">
            {/* SINGLE TABLE VIEW - showSearchInput={false} suppresses duplicate inner search bar */}
            <DataTable
              columns={columns}
              data={filteredData}
              showSearchInput={false}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in zoom-in-95">
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
