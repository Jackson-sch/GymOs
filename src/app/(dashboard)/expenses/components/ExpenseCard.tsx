"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Tag, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { deleteExpenseAction } from "@/lib/actions/expenses-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExpenseCardProps {
  expense: any;
  onDelete: (id: string) => void;
}

export function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  return (
    <Card className="glass-card interactive-hover border-white/5 overflow-hidden group">
      <CardContent className="p-0">
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                <Calendar className="size-3" />
                {formatDate(new Date(expense.date))}
              </div>
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {expense.description}
              </h3>
            </div>
            <ConfirmAction
              title="¿Eliminar gasto?"
              description={
                <>
                  Esta acción no se puede deshacer. El registro del gasto por{" "}
                  <span className="font-bold text-white">{formatCurrency(expense.amount)}</span> será borrado permanentemente.
                </>
              }
              onConfirm={async () => {
                const res = await deleteExpenseAction(expense.id);
                if (res.success) {
                  toast.success("Gasto eliminado");
                  onDelete(expense.id);
                } else {
                  toast.error(res.error || "Error al eliminar");
                }
              }}
            >
              <Button 
                variant="ghost" 
                size="icon"
                className="size-8 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="size-4" />
              </Button>
            </ConfirmAction>
          </div>

          {/* Body */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={cn(
                "text-[9px] uppercase font-bold border-none px-2 py-0.5",
                "bg-primary/10 text-primary"
              )}
              style={{ backgroundColor: expense.category?.color ? `${expense.category.color}20` : undefined, color: expense.category?.color }}
            >
              <Tag className="size-2.5 mr-1" />
              {expense.category?.name || "General"}
            </Badge>
            
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-rose-500 tracking-tighter">
                {formatCurrency(expense.amount)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer/Reference */}
        {expense.reference && (
          <div className="px-5 py-2.5 bg-white/5 border-t border-white/5 flex items-center gap-2">
            <CreditCard className="size-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest truncate">
              Ref: {expense.reference}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
