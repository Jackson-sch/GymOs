"use client";

import React, { type Dispatch, type SetStateAction } from "react";
import { Plus, Tag, LayoutGrid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import ExpenseForm from "@/components/shared/forms/ExpenseForm";
import CategoryForm from "@/components/shared/forms/CategoryForm";

interface CatFormData {
  name: string;
  description: string;
}

interface ExpenseFormData {
  amount: string;
  description: string;
  categoryId: string;
  reference: string;
}

interface ExpenseControlBarProps {
  viewMode: "list" | "grid";
  onViewModeChange: (v: "list" | "grid") => void;
  search: string;
  onSearchChange: (v: string) => void;
  dateFrom: string | null;
  dateTo: string | null;
  onDateRangeChange: (range: { from: string | null; to: string | null }) => void;
  isCatOpen: boolean;
  onCatOpenChange: (open: boolean) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  catFormData: CatFormData;
  onCatFormDataChange: Dispatch<SetStateAction<CatFormData>>;
  handleCreateCategory: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  onCatClose: Dispatch<SetStateAction<boolean>>;
  formData: ExpenseFormData;
  onFormDataChange: Dispatch<SetStateAction<ExpenseFormData>>;
  catData: any[];
  handleCreateExpense: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onExpenseClose: Dispatch<SetStateAction<boolean>>;
}

export function ExpenseControlBar({
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateRangeChange,
  isCatOpen,
  onCatOpenChange,
  isOpen,
  onOpenChange,
  catFormData,
  onCatFormDataChange,
  handleCreateCategory,
  isSaving,
  onCatClose,
  formData,
  onFormDataChange,
  catData,
  handleCreateExpense,
  onExpenseClose,
}: ExpenseControlBarProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
      <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
        {/* View Switcher Tabs */}
        <Tabs
          value={viewMode}
          onValueChange={(v) => onViewModeChange(v as "list" | "grid")}
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

        {/* Search Input */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por descripción, categoría o referencia..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl text-xs focus-visible:ring-primary/30 transition-colors"
          />
        </div>

        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onSelectRange={onDateRangeChange}
          placeholder="Filtrar por fechas"
          showPresets={false}
          align="start"
        />
      </div>

      {/* Action Dialog Triggers */}
      <div className="flex items-center gap-3 shrink-0">
        <Dialog open={isCatOpen} onOpenChange={onCatOpenChange}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-11 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-colors"
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
              setCatFormData={onCatFormDataChange}
              handleCreateCategory={handleCreateCategory}
              isSaving={isSaving}
              setIsCatOpen={onCatClose}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button className="h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform">
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
              setFormData={onFormDataChange}
              catData={catData}
              handleCreateExpense={handleCreateExpense}
              isSaving={isSaving}
              setIsOpen={onExpenseClose}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
