"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-3xl border-white/10 mt-6 backdrop-blur-md">
      <p className="text-xs font-semibold text-muted-foreground text-center sm:text-left">
        Mostrando <span className="text-foreground font-bold">{startItem} - {endItem}</span> de{" "}
        <span className="text-foreground font-bold">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-9 px-3 rounded-xl text-xs font-bold gap-1 border-white/10 bg-white/5 hover:bg-white/10"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {pageNumbers[0] > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              className="h-9 w-9 rounded-xl text-xs font-bold border-white/10 bg-white/5 hover:bg-white/10"
            >
              1
            </Button>
            {pageNumbers[0] > 2 && (
              <span className="text-xs text-muted-foreground px-1">...</span>
            )}
          </>
        )}

        {pageNumbers.map((p) => (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(p)}
            className={`h-9 min-w-9 px-2.5 rounded-xl text-xs font-bold transition-all ${
              p === currentPage
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
            }`}
          >
            {p}
          </Button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="text-xs text-muted-foreground px-1">...</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="h-9 w-9 rounded-xl text-xs font-bold border-white/10 bg-white/5 hover:bg-white/10"
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-9 px-3 rounded-xl text-xs font-bold gap-1 border-white/10 bg-white/5 hover:bg-white/10"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0">
          Por pág:
        </span>
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {pageSizeOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onPageSizeChange(opt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                pageSize === opt
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
