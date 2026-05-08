"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  History,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";
import { 
  getTrainerPayrollData, 
  settlePayrollAction, 
  getTrainerPayrollHistory 
} from "@/lib/actions/payroll-actions";

export function TrainerPayrollTab({ trainer }: { trainer: any }) {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [payrollData, setPayrollData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const fetchPayrollData = async () => {
    setIsLoading(true);
    const res = await getTrainerPayrollData(trainer.id, new Date(startDate), new Date(endDate));
    if (res.success) {
      setPayrollData(res.data);
    } else {
      toast.error(res.error);
    }
    setIsLoading(false);
  };

  const fetchHistory = async () => {
    const res = await getTrainerPayrollHistory(trainer.id);
    if (res.success) {
      setHistory(res.data || []);
    }
  };

  useEffect(() => {
    fetchPayrollData();
    fetchHistory();
  }, [trainer.id, startDate, endDate]);

  const handleSettle = async () => {
    if (!payrollData) return;
    
    setIsSettling(true);
    const res = await settlePayrollAction({
      trainerId: trainer.id,
      amount: payrollData.totalAmount,
      periodStart: new Date(startDate),
      periodEnd: new Date(endDate),
      createExpense: true,
    });

    if (res.success) {
      toast.success("Pago registrado con éxito");
      fetchHistory();
    } else {
      toast.error(res.error);
    }
    setIsSettling(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">Liquidación de Sueldos</h2>
        <div className="flex items-center gap-3 bg-background/50 p-1.5 rounded-xl border border-white/10">
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent border-none h-8 w-36 text-xs"
          />
          <span className="text-muted-foreground text-xs">al</span>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent border-none h-8 w-36 text-xs"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/10 shadow-xl bg-secondary/20 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Cálculo del Periodo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center animate-pulse text-muted-foreground text-xs uppercase tracking-widest">
                Calculando montos...
              </div>
            ) : payrollData ? (
              <>
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-4 rounded-2xl bg-background/30 border border-white/5 space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clases Dictadas</div>
                    <div className="text-2xl font-light">{payrollData.classesCount}</div>
                    <div className="text-[10px] text-primary/60 font-bold uppercase">× ${payrollData.perClassRate} c/u</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/30 border border-white/5 space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pago x Clases</div>
                    <div className="text-2xl font-light">${payrollData.perClassTotal.toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/30 border border-white/5 space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Salario Base</div>
                    <div className="text-2xl font-light">${payrollData.baseAmount.toLocaleString()}</div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center md:text-left">
                    <div className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Total a Liquidar</div>
                    <div className="text-4xl font-light text-foreground">${payrollData.totalAmount.toLocaleString()}</div>
                  </div>
                  <Button 
                    onClick={handleSettle}
                    disabled={isSettling || payrollData.totalAmount <= 0}
                    className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform w-full md:w-auto"
                  >
                    {isSettling ? <Zap className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                    {isSettling ? "Procesando..." : "Registrar Pago"}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Detalle de Clases</div>
                  {payrollData.classes.length === 0 ? (
                    <div className="text-center py-8 bg-background/20 rounded-2xl border border-dashed border-white/10 opacity-30 text-xs uppercase tracking-widest">
                      No se encontraron clases completadas en este rango
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                      {payrollData.classes.map((c: any) => (
                        <div key={c.id} className="flex justify-between items-center p-3 rounded-xl bg-background/20 border border-white/5 text-sm group hover:border-primary/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                              {format(new Date(c.startTime), "dd")}
                            </div>
                            <div>
                              <div className="font-medium">{c.name}</div>
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{format(new Date(c.startTime), "HH:mm")}</div>
                            </div>
                          </div>
                          <div className="text-xs font-bold opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all">${payrollData.perClassRate}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/10 shadow-sm bg-secondary/10 overflow-hidden">
             <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" /> Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Salario Base</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    disabled
                    value={trainer.baseSalary ? Number(trainer.baseSalary) : 0}
                    className="pl-9 bg-background/30 border-white/5 h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tarifa por Clase</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    disabled
                    value={trainer.perClassRate ? Number(trainer.perClassRate) : 0}
                    className="pl-9 bg-background/30 border-white/5 h-11"
                  />
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                * El salario base se suma íntegro al total. Edita el perfil del entrenador para modificar estos valores.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/10 shadow-sm bg-secondary/10 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Historial de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-6 opacity-30 text-xs uppercase tracking-widest flex flex-col items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Sin historial de pagos
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-background/40 border border-white/5 space-y-3 group hover:border-primary/20 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="text-lg font-light tracking-tight text-foreground">${Number(p.amount).toLocaleString()}</div>
                          <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                            {format(new Date(p.periodStart), "dd/MM")} - {format(new Date(p.periodEnd), "dd/MM")}
                          </div>
                        </div>
                        <Badge className="bg-primary/10 text-primary text-[8px] border-none font-bold">PAGADO</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase tracking-widest border-t border-white/5 pt-2">
                        <Calendar className="w-3 h-3" /> {format(new Date(p.createdAt), "dd MMM yyyy", { locale: es })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
