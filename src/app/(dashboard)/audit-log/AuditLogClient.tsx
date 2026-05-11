"use client";

import React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formats";
import { Shield, User, Info, AlertCircle, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryState } from "nuqs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AuditLogClient({ data }: { data: any[] }) {
  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-xs font-mono">{formatDate(row.original.createdAt, "dd/MM/yyyy HH:mm:ss")}</span>
      )
    },
    {
      accessorKey: "user.name",
      header: "Usuario",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
            <User className="w-3 h-3 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">{row.original.user?.name || "Sistema"}</span>
            <span className="text-[9px] text-muted-foreground uppercase">{row.original.user?.role}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "action",
      header: "Acción",
      cell: ({ row }) => {
        const action = row.original.action;
        const isCreate = action.includes("CREATE");
        const isUpdate = action.includes("UPDATE");
        const isDelete = action.includes("DELETE");
        const isLogin = action.includes("LOGIN");

        return (
          <Badge 
            variant="outline" 
            className={`text-[8px] uppercase tracking-widest px-2 ${
              isCreate ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
              isUpdate ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
              isDelete ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
              isLogin ? "bg-primary/10 text-primary border-primary/20" :
              "bg-slate-500/10 text-slate-500 border-slate-500/20"
            }`}
          >
            {action.replace(/_/g, " ")}
          </Badge>
        );
      }
    },
    {
      accessorKey: "entity",
      header: "Entidad",
      cell: ({ row }) => (
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
          {row.original.entity}
        </span>
      )
    },
    {
      id: "details",
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 group">
                <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">Detalle de Auditoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[9px] uppercase text-muted-foreground font-bold mb-1">Entidad ID</p>
                    <p className="text-xs font-mono break-all">{row.original.entityId || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[9px] uppercase text-muted-foreground font-bold mb-1">Dirección IP</p>
                    <p className="text-xs font-mono">{row.original.ipAddress || "Interna"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {row.original.oldData && (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase text-rose-400 font-bold tracking-widest">Datos Anteriores</p>
                      <pre className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-[10px] overflow-x-auto custom-scrollbar font-mono">
                        {JSON.stringify(row.original.oldData, null, 2)}
                      </pre>
                    </div>
                  )}
                  {row.original.newData && (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest">Datos Nuevos</p>
                      <pre className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] overflow-x-auto custom-scrollbar font-mono">
                        {JSON.stringify(row.original.newData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )
    }
  ], []);

  const [entity, setEntity] = useQueryState("entity", { defaultValue: "ALL" });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="w-[200px] bg-white/5 border-white/10">
            <SelectValue placeholder="Todas las entidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las entidades</SelectItem>
            <SelectItem value="Member">Socio</SelectItem>
            <SelectItem value="Payment">Pago</SelectItem>
            <SelectItem value="SystemConfig">Configuración</SelectItem>
            <SelectItem value="SYSTEM">Sistema</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="glass-card p-6 border-white/5">
        <DataTable 
          columns={columns} 
          data={data} 
          filterColumn="action" 
          placeholder="Filtrar por acción (EJ: CREATE_MEMBER)..." 
        />
      </div>
    </div>
  );
}
