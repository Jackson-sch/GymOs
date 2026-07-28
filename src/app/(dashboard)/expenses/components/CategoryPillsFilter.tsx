"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CategoryPillsFilterProps {
  categories: any[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryPillsFilter({ categories, selected, onSelect }: CategoryPillsFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
      <button type="button"
        onClick={() => onSelect("ALL")}
        className={cn(
          "px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-colors shrink-0",
          selected === "ALL"
            ? "bg-white text-black border-white shadow-sm"
            : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground",
        )}
      >
        Todas las Categorías
      </button>
      {categories.map((cat) => (
        <button type="button"
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-colors shrink-0",
            selected === cat.id
              ? "bg-white text-black border-white shadow-sm"
              : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground",
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
