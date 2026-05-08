"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin,
  Edit2,
  ArrowLeft,
  Save,
  X,
  Camera,
  Trash2,
  Move,
  Check,
  Activity,
  Trophy,
  Target,
  CreditCard,
  History,
  Weight,
  User as UserIcon,
  Crown,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { enablePortalAccess } from "@/lib/actions/members-actions";
import { format, isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Avatar from "boring-avatars";
import { MemberProgressTab } from "./MemberProgressTab";

// Reusable reposition hook (same as trainer for consistency)
function useDragReposition(initialPosition: number, onCommit: (pos: number) => void) {
  const [isRepositioning, setIsRepositioning] = React.useState(false);
  const [position, setPosition] = React.useState(initialPosition);
  const [savedPosition, setSavedPosition] = React.useState(initialPosition);
  const isDragging = React.useRef(false);
  const startY = React.useRef(0);
  const startPos = React.useRef(initialPosition);

  React.useEffect(() => {
    setPosition(initialPosition);
    setSavedPosition(initialPosition);
  }, [initialPosition]);

  const startDrag = React.useCallback((clientY: number) => {
    isDragging.current = true;
    startY.current = clientY;
    startPos.current = position;
  }, [position]);

  const moveDrag = React.useCallback((clientY: number) => {
    if (!isDragging.current) return;
    const delta = startY.current - clientY;
    const sensitivity = 0.6;
    const newPos = Math.min(100, Math.max(0, startPos.current + delta * sensitivity));
    setPosition(newPos);
  }, []);

  const endDrag = React.useCallback(() => {
    isDragging.current = false;
  }, []);

  const onMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (!isRepositioning) return;
    e.preventDefault();
    startDrag(e.clientY);
  }, [isRepositioning, startDrag]);

  React.useEffect(() => {
    if (!isRepositioning) return;
    const handleMouseMove = (e: MouseEvent) => moveDrag(e.clientY);
    const handleMouseUp = () => endDrag();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isRepositioning, moveDrag, endDrag]);

  return {
    isRepositioning,
    position,
    enterReposition: () => { setSavedPosition(position); setIsRepositioning(true); },
    confirmReposition: () => { setIsRepositioning(false); setSavedPosition(position); onCommit(position); },
    cancelReposition: () => { setPosition(savedPosition); setIsRepositioning(false); },
    onMouseDown,
    onTouchStart: (e: React.TouchEvent) => { if (isRepositioning) startDrag(e.touches[0].clientY); },
    onTouchMove: (e: React.TouchEvent) => { if (isRepositioning) { e.preventDefault(); moveDrag(e.touches[0].clientY); } },
    onTouchEnd: () => endDrag(),
  };
}

export function MemberProfileClient({ member }: { member: any }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [photoControlsVisible, setPhotoControlsVisible] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"GENERAL" | "PROGRESS">("GENERAL");
  const [isLinking, setIsLinking] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const [formData, setFormData] = React.useState({
    fullName: member.fullName || "",
    email: member.email || "",
    phone: member.phone || "",
    address: member.address || "",
    photo: member.photo || "",
    photoPosition: member.photoPosition || 50,
    status: member.status || "ACTIVE",
    dni: member.dni || "",
    birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : "",
  });

  const quickSave = async (updates: Partial<typeof formData>) => {
    try {
      const res = await fetch("/api/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, ...formData, ...updates }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Error al guardar cambios");
      }
    } catch (err) {
      toast.error("Error de conexión al guardar");
    }
  };

  const dragReposition = useDragReposition(
    formData.photoPosition,
    (newPos) => {
      const updates = { photoPosition: newPos };
      setFormData(prev => ({ ...prev, ...updates }));
      quickSave(updates);
    },
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, ...formData }),
      });
      const result = await res.json();
      if (result.id) {
        toast.success("Socio actualizado");
        setIsEditing(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Error al guardar");
      }
    } catch (err) {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    setIsUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const response = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await response.json();
      if (data.url) {
        const updates = { photo: data.url, photoPosition: 50 };
        setFormData(prev => ({ ...prev, ...updates }));
        await quickSave(updates);
        toast.success("Foto actualizada");
      }
    } catch (error: any) {
      toast.error("No se pudo subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async () => {
    const updates = { photo: "", photoPosition: 50 };
    setFormData(prev => ({ ...prev, ...updates }));
    await quickSave(updates);
    setPhotoControlsVisible(false);
    toast.success("Foto eliminada");
  };

  const handleEnablePortal = async () => {
    setIsLinking(true);
    try {
      const res = await enablePortalAccess(member.id);
      if (res.success) {
        toast.success(res.message);
        window.location.reload();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error("Error al habilitar el acceso");
    } finally {
      setIsLinking(false);
    }
  };

  const currentMembership = member.memberships?.[0];
  const planName = currentMembership?.plan?.name || "";
  const isVip = /vip|premium/i.test(planName);
  const isStandard = /est[aá]ndar/i.test(planName);
  const isBasic = /b[aá]sico/i.test(planName);
  const hasPlan = !!(planName);
  const attendancesThisMonth = React.useMemo(() => {
    if (!mounted) return 0;
    return (member.attendances || []).filter((a: any) => {
      const date = new Date(a.checkIn);
      return isAfter(date, startOfMonth(new Date())) && isBefore(date, endOfMonth(new Date()));
    }).length;
  }, [mounted, member.attendances]);

  const displayPosition = dragReposition.isRepositioning ? dragReposition.position : (formData.photoPosition ?? 50);

  if (!mounted) return null;

  return (
    <div className="min-h-screen pt-8 md:pt-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header Card */}
        <div className="relative mb-8">
          <Card className="bg-secondary/40 backdrop-blur-2xl border-border/10 shadow-2xl overflow-visible">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row gap-8 p-8 items-center md:items-start">
                <div 
                  className="relative group shrink-0"
                  onMouseEnter={() => formData.photo && !dragReposition.isRepositioning && setPhotoControlsVisible(true)}
                  onMouseLeave={() => !dragReposition.isRepositioning && setPhotoControlsVisible(false)}
                >
                  {/* Tier ring effects */}
                  {isVip && (
                    <div className="absolute -inset-1.5 rounded-full bg-linear-to-r from-amber-400 via-yellow-300 to-amber-500 animate-spin-slow opacity-80 blur-[1px] z-0" />
                  )}
                  {isStandard && (
                    <div className="absolute -inset-1 rounded-full bg-linear-to-br from-emerald-400/50 via-primary/40 to-teal-500/50 z-0" />
                  )}
                  {isBasic && (
                    <div className="absolute -inset-0.5 rounded-full z-0" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(148,163,184,0.3) 20deg, transparent 40deg, rgba(148,163,184,0.3) 60deg, transparent 80deg, rgba(148,163,184,0.3) 100deg, transparent 120deg, rgba(148,163,184,0.3) 140deg, transparent 160deg, rgba(148,163,184,0.3) 180deg, transparent 200deg, rgba(148,163,184,0.3) 220deg, transparent 240deg, rgba(148,163,184,0.3) 260deg, transparent 280deg, rgba(148,163,184,0.3) 300deg, transparent 320deg, rgba(148,163,184,0.3) 340deg, transparent 360deg)' }} />
                  )}
                  <div 
                    className={cn(
                      "w-40 h-40 rounded-full border shadow-2xl transition-all duration-300 relative overflow-hidden bg-muted/30 z-10",
                      dragReposition.isRepositioning
                        ? "border-primary ring-2 ring-primary/20 scale-105" 
                        : isVip 
                          ? "border-amber-400/60 ring-2 ring-amber-400/20"
                          : isStandard
                            ? "border-emerald-400/40 ring-1 ring-emerald-400/10"
                            : isBasic
                              ? "border-slate-400/30"
                              : "border-border/10 hover:border-primary/20"
                    )}
                    onMouseDown={dragReposition.onMouseDown}
                    onTouchStart={dragReposition.onTouchStart}
                    onTouchMove={dragReposition.onTouchMove}
                    onTouchEnd={dragReposition.onTouchEnd}
                  >
                    {isUploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/5 backdrop-blur-sm">
                        <Activity className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    ) : formData.photo ? (
                      <img 
                        src={formData.photo} 
                        alt={member.fullName}
                        className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 group-hover:scale-110"
                        style={{ objectPosition: `50% ${displayPosition}%` }}
                      />
                    ) : (
                      <Avatar
                        size={160}
                        name={member.fullName}
                        variant="beam"
                        colors={["#22c55e", "#10b981", "#059669", "#064e3b", "#0f172a"]}
                      />
                    )}
                    
                    {!dragReposition.isRepositioning && (
                      <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]">
                        <Camera className="w-8 h-8 text-white/90 drop-shadow-lg" />
                      </button>
                    )}

                    {dragReposition.isRepositioning && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                        <Move className="w-8 h-8 text-white animate-bounce drop-shadow-md" />
                      </div>
                    )}
                  </div>

                  {/* VIP Crown Badge */}
                  {isVip && !dragReposition.isRepositioning && (
                    <div className="absolute -top-1 -right-1 z-30 bg-linear-to-br from-amber-400 to-yellow-500 rounded-full p-1.5 shadow-lg shadow-amber-500/30 border-2 border-background animate-in zoom-in duration-500">
                      <Crown className="w-3.5 h-3.5 text-amber-900" />
                    </div>
                  )}

                  {(dragReposition.isRepositioning || (formData.photo && photoControlsVisible)) && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/95 backdrop-blur-xl border border-border/20 rounded-full p-1 shadow-2xl z-20 animate-in fade-in zoom-in duration-300">
                      {dragReposition.isRepositioning ? (
                        <>
                          <button onClick={dragReposition.confirmReposition} className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"><Check className="w-4 h-4" /></button>
                          <div className="w-px h-3 bg-border/50 mx-1" />
                          <button onClick={dragReposition.cancelReposition} className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"><Camera className="w-4 h-4" /></button>
                          <button onClick={dragReposition.enterReposition} className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"><Move className="w-4 h-4" /></button>
                          <button onClick={deletePhoto} className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
                </div>

                <div className="flex-1 w-full flex flex-col gap-6">
                  {isEditing ? (
                    <div className="grid gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Nombre Completo</Label>
                          <Input value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">DNI / Documento</Label>
                          <Input value={formData.dni} onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))} className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl" />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Email</Label>
                          <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Teléfono</Label>
                          <Input value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 text-center md:text-left">
                      <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground drop-shadow-sm">{member.fullName}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-primary/80 font-medium tracking-wide">
                          <Target className="w-4 h-4" />
                          <span className="text-sm uppercase tracking-[0.2em]">{member.status === 'ACTIVE' ? 'Socio Activo' : 'Socio Inactivo'}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-8 opacity-70">
                        <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /><span className="text-sm font-light">{member.email}</span></div>
                        <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /><span className="text-sm font-light">{member.phone}</span></div>
                        <div className="flex items-center gap-3"><UserIcon className="w-4 h-4 text-primary" /><span className="text-sm font-light">DNI: {member.dni}</span></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col gap-2 shrink-0 self-center md:self-start">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground shadow-xl shadow-primary/20 h-12 px-8 rounded-xl font-bold group">
                        {isSaving ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />}
                        {isSaving ? "Guardando" : "Guardar"}
                      </Button>
                      <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving} className="h-12 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all">
                        <X className="w-4 h-4 mr-2" /> Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => setIsEditing(true)} className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 shadow-lg shadow-primary/5 h-12 px-8 rounded-xl font-bold transition-all duration-300">
                        <Edit2 className="w-4 h-4 mr-2" /> Editar Perfil
                      </Button>
                      
                      {member.userId ? (
                        <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase font-bold tracking-widest shadow-lg shadow-emerald-500/5 animate-in fade-in zoom-in">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Acceso Habilitado
                        </div>
                      ) : (
                        <Button 
                          onClick={handleEnablePortal} 
                          disabled={isLinking}
                          className="bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground border border-accent/20 shadow-lg shadow-accent/5 h-12 px-8 rounded-xl font-bold transition-all duration-300 animate-in fade-in slide-in-from-right-4"
                        >
                          {isLinking ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                          Habilitar Portal
                        </Button>
                      )}

                      <Button variant="ghost" asChild className="h-12 opacity-60 hover:opacity-100 rounded-xl transition-all">
                        <Link href="/members"><ArrowLeft className="w-4 h-4 mr-2" /> Volver</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex bg-background/50 backdrop-blur-xl p-1.5 rounded-2xl w-fit mb-8 border border-white/10">
          <button
            onClick={() => setActiveTab("GENERAL")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300",
              activeTab === "GENERAL" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            Información General
          </button>
          <button
            onClick={() => setActiveTab("PROGRESS")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300",
              activeTab === "PROGRESS" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            Progreso
          </button>
        </div>

        {activeTab === "GENERAL" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Asistencias Mes", value: attendancesThisMonth, icon: Calendar, color: "text-primary" },
            { label: "Plan Actual", value: currentMembership?.plan?.name || "Sin Plan", icon: CreditCard, color: "text-primary" },
            { label: "Vencimiento", value: currentMembership?.endDate ? format(new Date(currentMembership.endDate), "dd MMM", { locale: es }) : "N/A", icon: Clock, color: "text-primary" },
            { label: "Último Peso", value: member.bodyMetrics?.[0]?.weight ? `${member.bodyMetrics[0].weight}kg` : "---", icon: Weight, color: "text-primary" },
          ].map((stat, i) => (
            <Card key={i} className="group hover:border-primary/20 transition-all duration-500 border-border/10 bg-secondary/20 backdrop-blur-sm overflow-hidden border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-2.5 rounded-xl bg-background/50 border border-border/20 group-hover:border-primary/40 transition-colors", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-light tracking-tighter text-foreground/90 truncate">{stat.value}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          {/* Recent Activity */}
          <div className="lg:col-span-7">
            <Card className="border-border/10 shadow-sm bg-secondary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" /> Historial de Asistencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(member.attendances || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                    <Calendar className="w-10 h-10 mb-4" />
                    <p className="text-xs uppercase tracking-widest">Sin asistencias registradas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(member.attendances || []).slice(0, 5).map((att: any) => (
                      <div key={att.id} className="flex items-center justify-between p-4 rounded-xl border border-border/10 bg-background/20 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{format(new Date(att.checkIn), "dd")}</div>
                          <div>
                            <div className="text-sm font-medium">{format(new Date(att.checkIn), "EEEE dd 'de' MMMM", { locale: es })}</div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{format(new Date(att.checkIn), "HH:mm")}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] border-primary/20 text-primary">ENTRADA</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Body Metrics & Plans */}
          <div className="lg:col-span-5 space-y-6">
             <Card className="border-border/10 shadow-sm bg-secondary/10">
              <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2"><Weight className="w-4 h-4 text-primary" /> Última Métrica</CardTitle></CardHeader>
              <CardContent>
                {member.bodyMetrics?.[0] ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-background/30 border border-border/10">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Peso</div>
                      <div className="text-2xl font-light">{member.bodyMetrics[0].weight}kg</div>
                    </div>
                    <div className="p-4 rounded-xl bg-background/30 border border-border/10">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Grasa</div>
                      <div className="text-2xl font-light">{member.bodyMetrics[0].bodyFat}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-30 text-xs uppercase tracking-widest">Sin mediciones</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/10 shadow-sm bg-secondary/10">
              <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Membresía Actual</CardTitle></CardHeader>
              <CardContent>
                {currentMembership ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xl font-medium text-primary">{currentMembership.plan?.name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Vence el {format(new Date(currentMembership.endDate), "dd/MM/yyyy")}</div>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-none">AL DÍA</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-30 text-xs uppercase tracking-widest">Sin membresía activa</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
          </>
        ) : (
          <MemberProgressTab member={member} />
        )}
      </div>
    </div>
  );
}
