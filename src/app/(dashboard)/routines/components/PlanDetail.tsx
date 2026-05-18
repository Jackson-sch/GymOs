"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Dumbbell,
  Target,
  Play
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import Link from "next/link";
import { RoutineSimulator } from "./RoutineSimulator";

interface PlanDetailProps {
  plan: any;
  onBack: () => void;
}

export function PlanDetail({ plan, onBack }: PlanDetailProps) {
  const [memberPage, setMemberPage] = useState(1);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const MEMBERS_PER_PAGE = 10;

  useEffect(() => {
    setMemberPage(1);
    setMemberSearchTerm("");
  }, [plan]);

  const filteredMembers = plan.routines.filter((r: any) => 
    r.member.fullName.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    r.member.dni?.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  const paginatedMembers = filteredMembers.slice(
    (memberPage - 1) * MEMBERS_PER_PAGE, 
    memberPage * MEMBERS_PER_PAGE
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      {/* Simulation Modal */}
      <RoutineSimulator 
        isOpen={isSimulating}
        onClose={() => setIsSimulating(false)}
        exercises={plan.routines[0]?.exercises || []}
        planName={plan.name}
      />

      {/* Header Detail */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:gap-3 transition-all group font-bold text-sm"
          >
            <ArrowLeft className="size-4" />
            VOLVER A TODOS LOS PLANES
          </button>
          <div>
            <h1 className="text-5xl font-serif tracking-tight">{plan.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Panel de gestión estratégica para el plan de entrenamiento personalizado. 
              Visualiza y administra a los miembros asignados y la estructura técnica.
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-card px-6 py-4 border-white/5 bg-white/5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Socios Totales</p>
            <p className="text-3xl font-serif text-primary">{plan.routines.length}</p>
          </div>
          <div className="glass-card px-6 py-4 border-white/5 bg-white/5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Ejercicios</p>
            <p className="text-3xl font-serif text-primary">{plan.exerciseCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Members Column */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="glass-card border-white/5 overflow-hidden flex flex-col bg-black/20">
            <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-xl font-serif">Socios Vinculados</h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar socio..." 
                  className="pl-9 h-10 bg-black/20 border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary/50"
                  value={memberSearchTerm}
                  onChange={(e) => {
                    setMemberSearchTerm(e.target.value);
                    setMemberPage(1);
                  }}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-bold py-4">Socio</TableHead>
                    <TableHead className="text-muted-foreground font-bold py-4">Entrenador</TableHead>
                    <TableHead className="text-muted-foreground font-bold py-4">Desde</TableHead>
                    <TableHead className="text-muted-foreground font-bold py-4 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.map((r: any) => (
                    <TableRow key={r.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            {r.member.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{r.member.fullName}</p>
                            <p className="text-[10px] text-muted-foreground">ID: {r.member.dni || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-muted-foreground">{r.trainer.fullName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link 
                          href={`/members/${r.member.id}`}
                          className="text-[10px] uppercase font-black tracking-widest text-primary hover:underline transition-all px-3 py-2 rounded-lg hover:bg-primary/5 inline-block"
                        >
                          Ver Perfil
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        No se encontraron socios con ese criterio.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {filteredMembers.length > MEMBERS_PER_PAGE && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  Mostrando {Math.min(filteredMembers.length, memberPage * MEMBERS_PER_PAGE)} de {filteredMembers.length} socios
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setMemberPage(p => Math.max(1, p - 1))}
                    disabled={memberPage === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button 
                    onClick={() => setMemberPage(p => p + 1)}
                    disabled={memberPage * MEMBERS_PER_PAGE >= filteredMembers.length}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tech Plan Column */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="glass-card border-white/5 flex flex-col h-[700px] bg-black/40 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="size-4 text-primary" />
              </div>
              <h3 className="text-xl font-serif">Plan Técnico</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {plan.routines[0]?.exercises?.length > 0 ? (
                plan.routines[0].exercises.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group/ex">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-[10px] font-black text-primary border border-white/5">
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <h4 className="font-bold text-sm group-hover/ex:text-primary transition-colors">{item.exercise.name}</h4>
                      </div>
                      <Badge variant="outline" className="text-[8px] uppercase tracking-tighter border-white/10 bg-white/5">
                        {item.exercise.muscleGroup}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="px-3 py-2 rounded-xl bg-black/20 border border-white/5">
                        <p className="text-[8px] uppercase text-muted-foreground font-bold">Series</p>
                        <p className="text-sm font-serif">{item.sets} <span className="text-[10px] font-sans text-muted-foreground italic">sets</span></p>
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-black/20 border border-white/5">
                        <p className="text-[8px] uppercase text-muted-foreground font-bold">Reps</p>
                        <p className="text-sm font-serif">{item.reps} <span className="text-[10px] font-sans text-muted-foreground italic">movs</span></p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 opacity-40">
                  <Dumbbell className="size-8 mx-auto mb-3" />
                  <p className="text-xs uppercase font-bold tracking-widest">Sin ejercicios configurados</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-primary/5 border-t border-white/5 mt-auto">
              <button 
                onClick={() => setIsSimulating(true)}
                disabled={!plan.routines[0]?.exercises?.length}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-100"
              >
                <Play className="size-3 fill-current" />
                Simular Rutina
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
