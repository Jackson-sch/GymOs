"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { columns } from "./columns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/formats";
import { User, Activity, Globe, Database, ArrowRight } from "lucide-react";

export function AuditLogClient({ data }: { data: any[] }) {
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const renderDiff = (oldData: any, newData: any) => {
    if (!newData) return <p className="text-muted-foreground italic text-xs">Sin datos de cambio registrados.</p>;
    
    // Si es creación, solo mostramos el newData
    if (!oldData || Object.keys(oldData).length === 0) {
      return (
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Datos Iniciales</p>
          <pre className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl text-[10px] font-mono overflow-x-auto text-emerald-200/70">
            {JSON.stringify(newData, null, 2)}
          </pre>
        </div>
      );
    }

    // Si es actualización, intentamos mostrar qué cambió
    const changes = Object.keys(newData).filter(key => 
      JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])
    );

    return (
      <div className="space-y-6">
        {changes.length > 0 ? (
          changes.map(key => (
            <div key={key} className="space-y-2 group">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold group-hover:text-white transition-colors">{key}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl relative">
                  <span className="absolute -top-2 left-3 bg-rose-500 text-[8px] font-black px-1.5 rounded uppercase">Anterior</span>
                  <pre className="text-[10px] font-mono text-rose-200/50 break-word whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(oldData[key], null, 2)}
                  </pre>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl relative">
                  <span className="absolute -top-2 left-3 bg-emerald-500 text-[8px] font-black px-1.5 rounded uppercase">Nuevo</span>
                  <pre className="text-[10px] font-mono text-emerald-200/70 break-word whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(newData[key], null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground italic text-xs">No se detectaron cambios estructurales.</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <DataTable
        columns={columns}
        data={data}
        filterColumn="entity"
        placeholder="Filtrar por entidad (MEMBER, PAYMENT...)"
        onRowClick={(row) => setSelectedLog(row)}
      />

      <Sheet open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent className="glass-card border-l border-white/20 bg-zinc-950/75! backdrop-blur-3xl! shadow-[-20px_0_50px_rgba(0,0,0,0.8)] w-[90vw]! sm:w-[85vw]! md:w-[75vw]! lg:w-[65vw]! xl:w-[55vw]! max-w-none! flex flex-col p-0 overflow-hidden z-50">
          {selectedLog && (
            <>
              <SheetHeader className="p-8 border-b border-white/5 shrink-0">
                <div className="flex justify-between items-start mr-8">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Activity className="size-4" />
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                        Detalle de Auditoría
                      </span>
                    </div>
                    <SheetTitle className="text-4xl font-serif text-foreground">
                      {selectedLog.action} en {selectedLog.entity}
                    </SheetTitle>
                    <SheetDescription className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      ID del Evento: <span className="text-foreground font-mono">{selectedLog.id}</span>
                    </SheetDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest mt-1">
                    {selectedLog.entity}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Metadata Column */}
                  <div className="space-y-8 lg:col-span-1">
                    <section className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2">
                        <User className="size-3" /> Ejecutor
                      </h4>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-1">
                        <p className="text-sm font-semibold">{selectedLog.user.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{selectedLog.user.email}</p>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2">
                        <Globe className="size-3" /> Contexto Técnico
                      </h4>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Dirección IP</p>
                          <p className="text-xs font-mono">{selectedLog.ipAddress || "Internal/VPN"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Timestamp</p>
                          <p className="text-xs">{formatDate(selectedLog.createdAt, "PPP")} a las {formatTime(selectedLog.createdAt)}</p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2">
                        <Database className="size-3" /> Referencia
                      </h4>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Entity ID</p>
                        <p className="text-[10px] font-mono break-all">{selectedLog.entityId}</p>
                      </div>
                    </section>
                  </div>

                  {/* Diff Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2 mb-4">
                      <ArrowRight className="size-3" /> Transformación de Datos
                    </h4>
                    <div className="glass-card bg-zinc-950/50 p-6 border-white/5 min-h-[400px]">
                      {renderDiff(selectedLog.oldData, selectedLog.newData)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

