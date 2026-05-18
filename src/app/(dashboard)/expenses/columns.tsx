"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { deleteExpenseAction } from "@/lib/actions/expenses-actions";
import { toast } from "sonner";

export const getColumns = (setData: React.Dispatch<React.SetStateAction<any[]>>): ColumnDef<any>[] => [
  {
    accessorKey: "date",
    header: "FECHA",
    cell: ({ row }) => (
      <span className="font-medium text-muted-foreground text-xs">
        {formatDate(new Date(row.original.date))}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "DESCRIPCIÓN",
    cell: ({ row }) => (
      <span className="font-medium text-foreground text-sm">
        {row.original.description}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "CATEGORÍA",
    cell: ({ row }) => {
      const cat = row.original.category;
      return (
        <Badge variant="outline" className="text-[10px] uppercase font-bold bg-white/5 border-white/10 px-2 py-0.5">
          {cat?.name || "Sin categoría"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "MONTO",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-red-500 text-sm">
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">ACCIONES</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <ConfirmAction
            title="¿Eliminar gasto?"
            description={
              <>
                Esta acción no se puede deshacer. El registro del gasto por{" "}
                <span className="font-bold text-white">{formatCurrency(row.original.amount)}</span> será borrado permanentemente.
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
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="size-4" />
            </Button>
          </ConfirmAction>
        </div>
      );
    },
  },
];
