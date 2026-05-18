"use client";

import React, { useState, type SyntheticEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, TrendingUp, Camera } from "lucide-react";
import { StackedAreaChart } from "@/components/charts/StackedAreaChart";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { addBodyMetricAction } from "@/lib/actions/anthropometry-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/shared/ImageUpload";
import Image from "next/image";

interface BodyMetric {
  id: string;
  weight?: number | null;
  height?: number | null;
  bodyFat?: number | null;
  muscle?: number | null;
  photoFrontUrl?: string | null;
  photoBackUrl?: string | null;
  photoSideUrl?: string | null;
  measuredAt?: string | Date | null;
  createdAt?: string | Date;
  date?: string | Date;
}

const progressReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_METRICS": return { ...state, metrics: action.payload };
    case "ADD_METRIC": return { ...state, metrics: [...state.metrics, action.payload] };
    case "SET_ADDING": return { ...state, isAdding: action.payload };
    case "SET_SUBMITTING": return { ...state, isSubmitting: action.payload };
    case "UPDATE_FORM": return { ...state, formData: { ...state.formData, ...action.payload } };
    case "RESET_FORM": return { ...state, formData: { weight: "", height: "", bodyFat: "", muscle: "", notes: "", photoFrontUrl: "", photoBackUrl: "", photoSideUrl: "" } };
    case "SET_MOUNTED": return { ...state, mounted: true };
    default: return state;
  }
};

export function MemberProgressTab({ member }: { member: any }) {
  const [state, dispatch] = React.useReducer(progressReducer, {
    metrics: member.bodyMetrics || [],
    isAdding: false,
    isSubmitting: false,
    mounted: false,
    formData: { weight: "", height: "", bodyFat: "", muscle: "", notes: "", photoFrontUrl: "", photoBackUrl: "", photoSideUrl: "" }
  });

  const { metrics, isAdding, isSubmitting, formData, mounted } = state;

  React.useEffect(() => {
    dispatch({ type: "SET_MOUNTED" });
  }, []);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: "SET_SUBMITTING", payload: true });
    
    const data = {
      memberId: member.id,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
      muscle: formData.muscle ? parseFloat(formData.muscle) : undefined,
      notes: formData.notes,
      photoFrontUrl: formData.photoFrontUrl || undefined,
      photoBackUrl: formData.photoBackUrl || undefined,
      photoSideUrl: formData.photoSideUrl || undefined,
    };

    const res = await addBodyMetricAction(data);
    if (res.success && res.metric) {
      toast.success("Métrica registrada con éxito");
      dispatch({ type: "ADD_METRIC", payload: res.metric });
      dispatch({ type: "SET_ADDING", payload: false });
      dispatch({ type: "RESET_FORM" });
    } else {
      toast.error(res.error || "Error al registrar métrica");
    }
    
    dispatch({ type: "SET_SUBMITTING", payload: false });
  };

  // Prepara la data para el gráfico de peso
  const weightData = metrics.reduce((acc: { name: string; value: number }[], m: BodyMetric) => {
    if (m.weight) {
      const date = m.measuredAt || m.createdAt || m.date || new Date();
      acc.push({
        name: format(new Date(date), "dd/MM", { locale: es }),
        value: Number(m.weight)
      });
    }
    return acc;
  }, []);

  const latestWithPhotos = metrics.slice().reverse().find((m: any) => m.photoFrontUrl || m.photoBackUrl || m.photoSideUrl);

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">Progreso Corporal</h2>
        <Dialog open={isAdding} onOpenChange={(val) => dispatch({ type: "SET_ADDING", payload: val })}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="size-4 mr-2" /> Nueva Métrica
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card bg-background/80 backdrop-blur-2xl border-white/10 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Registrar Medidas y Fotos</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Peso (kg)</Label>
                  <Input 
                    type="number" step="0.1" 
                    value={formData.weight} 
                    onChange={e => dispatch({ type: "UPDATE_FORM", payload: { weight: e.target.value } })} 
                    className="bg-background/50 border-white/10 h-11 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Estatura (cm)</Label>
                  <Input 
                    type="number" step="0.1" 
                    value={formData.height} 
                    onChange={e => dispatch({ type: "UPDATE_FORM", payload: { height: e.target.value } })} 
                    className="bg-background/50 border-white/10 h-11 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">% Grasa</Label>
                  <Input 
                    type="number" step="0.1" 
                    value={formData.bodyFat} 
                    onChange={e => dispatch({ type: "UPDATE_FORM", payload: { bodyFat: e.target.value } })} 
                    className="bg-background/50 border-white/10 h-11 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">% Músculo</Label>
                  <Input 
                    type="number" step="0.1" 
                    value={formData.muscle} 
                    onChange={e => dispatch({ type: "UPDATE_FORM", payload: { muscle: e.target.value } })} 
                    className="bg-background/50 border-white/10 h-11 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/10">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Fotos de Progreso (Opcional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Frontal</span>
                    <ImageUpload
                      value={formData.photoFrontUrl}
                      onChange={(url) => dispatch({ type: "UPDATE_FORM", payload: { photoFrontUrl: url } })}
                      onRemove={() => dispatch({ type: "UPDATE_FORM", payload: { photoFrontUrl: "" } })}
                      disabled={isSubmitting}
                      className="w-32 h-32"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Espalda</span>
                    <ImageUpload
                      value={formData.photoBackUrl}
                      onChange={(url) => dispatch({ type: "UPDATE_FORM", payload: { photoBackUrl: url } })}
                      onRemove={() => dispatch({ type: "UPDATE_FORM", payload: { photoBackUrl: "" } })}
                      disabled={isSubmitting}
                      className="w-32 h-32"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Perfil</span>
                    <ImageUpload
                      value={formData.photoSideUrl}
                      onChange={(url) => dispatch({ type: "UPDATE_FORM", payload: { photoSideUrl: url } })}
                      onRemove={() => dispatch({ type: "UPDATE_FORM", payload: { photoSideUrl: "" } })}
                      disabled={isSubmitting}
                      className="w-32 h-32"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Notas</Label>
                <Input 
                  value={formData.notes} 
                  onChange={e => dispatch({ type: "UPDATE_FORM", payload: { notes: e.target.value } })} 
                  className="bg-background/50 border-white/10 h-11"
                  placeholder="Ej. Después del desayuno"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => dispatch({ type: "SET_ADDING", payload: false })} className="border-white/10 bg-white/5 hover:bg-white/10">Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground font-bold tracking-widest uppercase text-xs">
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
              <TrendingUp className="size-4 text-primary" /> Evolución de Peso (kg)
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
                <Camera className="size-4 text-primary" /> Progreso Visual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestWithPhotos ? (
                <div className="space-y-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Últimas fotos de progreso ({mounted && format(new Date(latestWithPhotos.measuredAt || latestWithPhotos.createdAt || new Date()), "dd MMM yyyy", { locale: es })})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {latestWithPhotos.photoFrontUrl && (
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-black/40">
                        <Image src={latestWithPhotos.photoFrontUrl} alt="Frontal" fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[9px] uppercase font-bold text-center tracking-wider text-primary">Frontal</div>
                      </div>
                    )}
                    {latestWithPhotos.photoBackUrl && (
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-black/40">
                        <Image src={latestWithPhotos.photoBackUrl} alt="Espalda" fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[9px] uppercase font-bold text-center tracking-wider text-primary">Espalda</div>
                      </div>
                    )}
                    {latestWithPhotos.photoSideUrl && (
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-black/40">
                        <Image src={latestWithPhotos.photoSideUrl} alt="Perfil" fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[9px] uppercase font-bold text-center tracking-wider text-primary">Perfil</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center opacity-40 border-2 border-dashed border-white/10 rounded-xl bg-background/30">
                  <Camera className="size-8 mb-4" />
                  <p className="text-xs uppercase tracking-widest">Sin fotos de progreso</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Registra una métrica con fotos para visualizar aquí</p>
                </div>
              )}
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
                  {metrics.slice().reverse().slice(0, 3).map((m: any) => (
                    <div key={m.id} className="flex justify-between items-center p-3 rounded-lg bg-background/40 border border-white/5">
                      <div>
                        <div className="text-sm font-bold">{m.weight ? `${m.weight}kg` : "---"}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {mounted 
                            ? format(new Date(m.measuredAt || m.createdAt || m.date || new Date()), "dd MMM yyyy", { locale: es }) 
                            : "..."}
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
