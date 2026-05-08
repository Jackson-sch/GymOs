"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Weight, Activity, Ruler, TrendingUp, Camera } from "lucide-react";
import { StackedAreaChart } from "@/components/charts/StackedAreaChart";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { addBodyMetricAction } from "@/lib/actions/anthropometry-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function MemberProgressTab({ member }: { member: any }) {
  const [metrics, setMetrics] = useState(member.bodyMetrics || []);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    bodyFat: "",
    muscle: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = {
      memberId: member.id,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
      muscle: formData.muscle ? parseFloat(formData.muscle) : undefined,
      notes: formData.notes,
    };

    const res = await addBodyMetricAction(data);
    if (res.success && res.metric) {
      toast.success("Métrica registrada con éxito");
      setMetrics([...metrics, res.metric]);
      setIsAdding(false);
      setFormData({ weight: "", height: "", bodyFat: "", muscle: "", notes: "" });
    } else {
      toast.error(res.error || "Error al registrar métrica");
    }
    
    setIsSubmitting(false);
  };

  // Prepara la data para el gráfico de peso
  const weightData = metrics.filter((m: any) => m.weight).map((m: any) => ({
    name: format(new Date(m.measuredAt || m.createdAt || m.date || Date.now()), "dd/MM", { locale: es }),
    value: parseFloat(m.weight)
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">Progreso Corporal</h2>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Nueva Métrica
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card bg-background/80 backdrop-blur-2xl border-white/10 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Registrar Medidas</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Peso (kg)</Label>
                  <Input 
                    type="number" step="0.1" 
                    value={formData.weight} 
                    onChange={e => setFormData({...formData, weight: e.target.value})} 
                    className="bg-background/50 border-white/10 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Estatura (cm)</Label>
                  <Input 
                    type="number" step="0.1" 
                    value={formData.height} 
                    onChange={e => setFormData({...formData, height: e.target.value})} 
                    className="bg-background/50 border-white/10 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">% Grasa</Label>
                  <Input 
                    type="number" step="0.1" 
                    value={formData.bodyFat} 
                    onChange={e => setFormData({...formData, bodyFat: e.target.value})} 
                    className="bg-background/50 border-white/10 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">% Músculo</Label>
                  <Input 
                    type="number" step="0.1" 
                    value={formData.muscle} 
                    onChange={e => setFormData({...formData, muscle: e.target.value})} 
                    className="bg-background/50 border-white/10 h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Notas</Label>
                <Input 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})} 
                  className="bg-background/50 border-white/10 h-11"
                  placeholder="Ej. Después del desayuno"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="border-white/10 bg-white/5 hover:bg-white/10">Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground">
                  {isSubmitting ? "Guardando..." : "Guardar Registro"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/10 shadow-xl bg-secondary/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Evolución de Peso (kg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weightData.length > 0 ? (
              <StackedAreaChart data={weightData} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground uppercase tracking-widest text-sm">
                No hay datos suficientes
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/10 shadow-sm bg-secondary/10">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" /> Progreso Visual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center opacity-40 border-2 border-dashed border-white/10 rounded-xl bg-background/30">
                <Camera className="w-8 h-8 mb-4" />
                <p className="text-xs uppercase tracking-widest">Sube fotos de progreso</p>
                <Button variant="link" className="text-primary text-xs mt-2">Próximamente</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/10 shadow-sm bg-secondary/10">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60">
                Últimos Registros
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <div className="text-center py-4 text-xs uppercase tracking-widest opacity-50">Sin registros</div>
              ) : (
                <div className="space-y-4">
                  {metrics.slice().reverse().slice(0, 3).map((m: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-background/40 border border-white/5">
                      <div>
                        <div className="text-sm font-bold">{m.weight ? `${m.weight}kg` : "---"}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {format(new Date(m.measuredAt || m.createdAt || m.date || Date.now()), "dd MMM yyyy", { locale: es })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-primary">{m.bodyFat ? `${m.bodyFat}% Grasa` : ""}</div>
                        <div className="text-xs text-blue-400">{m.muscle ? `${m.muscle}% Músculo` : ""}</div>
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
