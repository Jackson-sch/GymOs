"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PlanMembersCardProps {
  routines: any[];
  onAddMember?: () => void;
}

const MEMBERS_PER_PAGE = 10;

export function PlanMembersCard({ routines, onAddMember }: PlanMembersCardProps) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [prevRoutines, setPrevRoutines] = useState(routines);
  if (routines !== prevRoutines) {
    setPrevRoutines(routines);
    setPage(1);
  }

  const filtered = (routines || []).filter((r: any) => {
    if (!searchTerm.trim()) return true;
    const memberName = r.member?.fullName || "";
    const memberDni = r.member?.dni || "";
    const term = searchTerm.toLowerCase();
    return (
      memberName.toLowerCase().includes(term) ||
      memberDni.toLowerCase().includes(term)
    );
  });

  const paginated = filtered.slice(
    (page - 1) * MEMBERS_PER_PAGE,
    page * MEMBERS_PER_PAGE
  );

  return (
    <div className="glass-card border-border/70 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col backdrop-blur-md h-full">
      <div className="p-5 sm:p-6 border-b border-border/60 dark:border-white/10 bg-muted/20 dark:bg-white/[0.02] flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-serif font-bold text-foreground">
              Socios Vinculados
            </h3>
            <p className="text-xs text-muted-foreground">
              Alumnos con esta rutina asignada en su expediente
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por socio o DNI..."
              className="pl-10 h-10 bg-background/80 border-border/80 rounded-xl text-xs focus-visible:ring-primary/40"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {onAddMember && (
            <Button
              type="button"
              onClick={onAddMember}
              className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider gap-1.5 shadow-md shadow-primary/15 shrink-0"
            >
              <UserPlus className="size-4" />
              Agregar Socio
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40 dark:bg-white/5">
            <TableRow className="border-border/60 dark:border-white/10 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-bold text-xs py-3">
                Socio
              </TableHead>
              <TableHead className="text-muted-foreground font-bold text-xs py-3 hidden sm:table-cell">
                Entrenador
              </TableHead>
              <TableHead className="text-muted-foreground font-bold text-xs py-3 hidden md:table-cell">
                Asignado
              </TableHead>
              <TableHead className="text-muted-foreground font-bold text-xs py-3 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((r: any) => (
              <TableRow
                key={r.id}
                className="border-border/50 dark:border-white/5 hover:bg-muted/40 dark:hover:bg-white/5 transition-colors group"
              >
                <TableCell className="py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {r.member?.fullName?.substring(0, 2).toUpperCase() || "M"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[160px] sm:max-w-[220px]">
                        {r.member?.fullName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        DNI: {r.member?.dni || "S/D"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium hidden sm:table-cell whitespace-nowrap">
                  {r.trainer?.fullName || "Staff Entrenador"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono hidden md:table-cell whitespace-nowrap">
                  {r.createdAt
                    ? format(new Date(r.createdAt), "dd MMM yyyy", { locale: es })
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Link
                    href={`/members/${r.member?.id}`}
                    className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-primary hover:underline px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    Ver Perfil <ExternalLink className="size-3" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground text-xs"
                >
                  No se encontraron socios asignados a este plan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > MEMBERS_PER_PAGE && (
        <div className="p-4 border-t border-border/60 dark:border-white/10 flex items-center justify-between bg-muted/20 dark:bg-white/[0.02]">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            Mostrando {Math.min(filtered.length, page * MEMBERS_PER_PAGE)} de{" "}
            {filtered.length} socios
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0 rounded-lg border-border/80 dark:border-white/10"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * MEMBERS_PER_PAGE >= filtered.length}
              className="h-8 w-8 p-0 rounded-lg border-border/80 dark:border-white/10"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
