"use client";

import React from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formats";

interface AuditTabProps {
  auditLogs: any[];
  loadingLogs: boolean;
  currentPage: number;
  totalPages: number;
  onRefresh: () => void;
  setCurrentPage: (page: any) => void;
}

export function AuditTab({
  auditLogs,
  loadingLogs,
  currentPage,
  totalPages,
  onRefresh,
  setCurrentPage,
}: AuditTabProps) {
  return (
    <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif mb-1">Registro de Auditoría</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Historial de acciones administrativas críticas
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loadingLogs}
          className="rounded-xl h-10 px-4 gap-2"
        >
          <Sparkles className={cn("size-4", loadingLogs && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      <div className="border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/2 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase tracking-widest text-muted-foreground">
                Fecha
              </th>
              <th className="px-6 py-4 font-semibold uppercase tracking-widest text-muted-foreground">
                Usuario
              </th>
              <th className="px-6 py-4 font-semibold uppercase tracking-widest text-muted-foreground">
                Acción
              </th>
              <th className="px-6 py-4 font-semibold uppercase tracking-widest text-muted-foreground">
                Entidad
              </th>
              <th className="px-6 py-4 font-semibold uppercase tracking-widest text-muted-foreground">
                IP
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loadingLogs ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-4 bg-white/1 h-12" />
                </tr>
              ))
            ) : auditLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-muted-foreground italic"
                >
                  No hay registros de auditoría disponibles
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/1 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDate(new Date(log.createdAt), "dd MMM, HH:mm")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{log.user.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {log.user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] uppercase font-semibold",
                        log.action === "DELETE"
                          ? "border-destructive/50 text-destructive"
                          : log.action === "CREATE"
                            ? "border-primary/50 text-primary"
                            : "border-white/10",
                      )}
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{log.entity}</span>
                      <span className="text-[10px] text-muted-foreground tracking-tighter">
                        {log.entityId}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">
                    {log.ipAddress}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <p className="text-xs text-muted-foreground">
            Página{" "}
            <span className="text-foreground font-medium">{currentPage}</span>{" "}
            de{" "}
            <span className="text-foreground font-medium">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || loadingLogs}
              onClick={() => setCurrentPage((prev: any) => Math.max(1, prev - 1))}
              className="rounded-xl h-10 px-4 border-white/10"
            >
              <ChevronLeft className="size-4 mr-2" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || loadingLogs}
              onClick={() =>
                setCurrentPage((prev: any) => Math.min(totalPages, prev + 1))
              }
              className="rounded-xl h-10 px-4 border-white/10"
            >
              Siguiente
              <ChevronRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
