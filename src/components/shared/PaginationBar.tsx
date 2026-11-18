"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PaginationBar({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [8, 12, 24, 48],
  itemLabel = "elementos",
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 3;
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 glass-card px-4 py-3.5 rounded-2xl border-border/70 dark:border-white/10 mt-6 backdrop-blur-md">
      <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        Mostrando <span className="text-foreground font-bold tabular-nums">{startItem}-{endItem}</span> de{" "}
        <span className="text-foreground font-bold tabular-nums">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="sm"
          aria-label="Página anterior"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 px-2.5 rounded-xl text-xs font-semibold gap-1 border-border/70 dark:border-white/10 bg-muted/40 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10"
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden xl:inline">Anterior</span>
        </Button>

        {pageNumbers[0] > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              className="h-8 min-w-8 px-2 rounded-xl text-xs font-bold tabular-nums border-border/70 dark:border-white/10 bg-muted/40 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10"
            >
              1
            </Button>
            {pageNumbers[0] > 2 && (
              <span className="text-xs text-muted-foreground px-0.5 select-none">…</span>
            )}
          </>
        )}

        {pageNumbers.map((p) => (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(p)}
            className={`h-8 min-w-8 px-2 rounded-xl text-xs font-bold tabular-nums transition-colors ${
              p === currentPage
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "border-border/70 dark:border-white/10 bg-muted/40 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 text-foreground"
            }`}
          >
            {p}
          </Button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="text-xs text-muted-foreground px-0.5 select-none">…</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="h-8 min-w-8 px-2 rounded-xl text-xs font-bold tabular-nums border-border/70 dark:border-white/10 bg-muted/40 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10"
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          aria-label="Página siguiente"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 px-2.5 rounded-xl text-xs font-semibold gap-1 border-border/70 dark:border-white/10 bg-muted/40 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10"
        >
          <span className="hidden xl:inline">Siguiente</span>
          <ChevronRight className="size-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">
          Por pág:
        </span>
        <Select
          value={String(pageSize)}
          onValueChange={(val) => onPageSizeChange(Number(val))}
        >
          <SelectTrigger
            aria-label="Elementos por página"
            className="h-8 w-[72px] rounded-xl border-border/70 dark:border-white/10 bg-muted/40 dark:bg-white/5 text-xs font-bold tabular-nums"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {pageSizeOptions.map((opt) => (
              <SelectItem
                key={opt}
                value={String(opt)}
                className="text-xs font-semibold tabular-nums"
              >
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
