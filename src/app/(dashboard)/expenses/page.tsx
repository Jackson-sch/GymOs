import React from "react";
import { getExpensesAction, getExpenseCategoriesAction } from "@/lib/actions/expenses-actions";
import { TrendingDown } from "lucide-react";
import { ExpensesClient } from "./ExpensesClient";

export default async function ExpensesPage() {
  const [expensesRes, categoriesRes] = await Promise.all([
    getExpensesAction(),
    getExpenseCategoriesAction()
  ]);

  const expenses = expensesRes.success ? (expensesRes.data as any[]) : [];
  const categories = categoriesRes.success ? (categoriesRes.data as any[]) : [];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <TrendingDown className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Gestión de Tesorería</span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Egresos & Gastos</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Controlando la <span className="text-foreground font-medium">caja chica</span> y gastos operativos del gimnasio.
          </p>
        </div>
      </div>

      {/* Main Client Component */}
      <ExpensesClient expenses={expenses} categories={categories} />
    </div>
  );
}
