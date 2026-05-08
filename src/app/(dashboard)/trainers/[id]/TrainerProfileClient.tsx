"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  Users, 
  Clock, 
  MapPin,
  Edit2,
  ArrowLeft,
  Star,
  Save,
  X,
  Plus,
  Camera,
  Trash2,
  Move,
  Check,
  Zap,
  Activity,
  Trophy,
  Target
} from "lucide-react";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Avatar from "boring-avatars";
import { TrainerPayrollTab } from "./TrainerPayrollTab";

// ─── Facebook-style drag-to-reposition hook ────────────────────────────────
function useDragReposition(
  initialPosition: number,
  onCommit: (pos: number) => void,
) {
  const [isRepositioning, setIsRepositioning] = React.useState(false);
  const [position, setPosition] = React.useState(initialPosition);
  const [savedPosition, setSavedPosition] = React.useState(initialPosition);
  const isDragging = React.useRef(false);
  const startY = React.useRef(0);
  const startPos = React.useRef(initialPosition);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync when initial position changes from parent
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
    // ~150px drag = full range (0..100). Inverted: drag up = higher position %
    const sensitivity = 0.6;
    const newPos = Math.min(100, Math.max(0, startPos.current + delta * sensitivity));
    setPosition(newPos);
  }, []);

  const endDrag = React.useCallback(() => {
    isDragging.current = false;
  }, []);

  // Mouse events
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

  // Touch events
  const onTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (!isRepositioning) return;
    startDrag(e.touches[0].clientY);
  }, [isRepositioning, startDrag]);

  const onTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isRepositioning) return;
    e.preventDefault();
    moveDrag(e.touches[0].clientY);
  }, [isRepositioning, moveDrag]);

  const onTouchEnd = React.useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleEnterReposition = React.useCallback(() => {
    setSavedPosition(position);
    setIsRepositioning(true);
  }, [position]);

  const confirmReposition = React.useCallback(() => {
    setIsRepositioning(false);
    setSavedPosition(position);
    onCommit(position);
  }, [position, onCommit]);

  const cancelReposition = React.useCallback(() => {
    setPosition(savedPosition);
    setIsRepositioning(false);
  }, [savedPosition]);

  return {
    isRepositioning,
    position,
    containerRef,
    enterReposition: handleEnterReposition,
    confirmReposition,
    cancelReposition,
    onMouseDown,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

export function TrainerProfileClient({ trainer }: { trainer: any }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [photoControlsVisible, setPhotoControlsVisible] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"GENERAL" | "PAYROLL">("GENERAL");
  const [mounted, setMounted] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  const [formData, setFormData] = React.useState<{
    fullName: string;
    email: string;
    phone: string;
    bio: string;
    photo: string;
    photoPosition: number;
    specialties: string[];
    commissionPct: number | null;
    baseSalary: number | null;
    perClassRate: number | null;
  }>({
    fullName: trainer.fullName || "",
    email: trainer.email || "",
    phone: trainer.phone || "",
    bio: trainer.bio || "",
    photo: trainer.photo || "",
    photoPosition: trainer.photoPosition || 50,
    specialties: trainer.specialties || [],
    commissionPct: trainer.commissionPct ? Number(trainer.commissionPct) : null,
    baseSalary: trainer.baseSalary ? Number(trainer.baseSalary) : null,
    perClassRate: trainer.perClassRate ? Number(trainer.perClassRate) : null,
  });
  const [newSpecialty, setNewSpecialty] = React.useState("");

  // Helper to save a single field or partial update
  const quickSave = async (updates: Partial<typeof formData>) => {
    try {
      const res = await fetch("/api/trainers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trainer.id, ...formData, ...updates }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("quickSave failed:", res.status, err);
        toast.error(err.error || "Error al guardar cambios");
      }
    } catch (err) {
      console.error("Error saving updates:", err);
      toast.error("Error de conexión al guardar");
    }
  };

  // Facebook-style drag reposition
  const dragReposition = useDragReposition(
    formData.photoPosition,
    (newPos) => {
      const updates = { photoPosition: newPos };
      setFormData(prev => ({ ...prev, ...updates }));
      quickSave(updates);
    },
  );

  const classesThisWeek = React.useMemo(() => {
    if (!mounted) return [];
    return (trainer.classes || []).filter((c: any) => {
      const classDate = new Date(c.startTime);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return isAfter(classDate, startOfDay(now)) && isBefore(classDate, weekFromNow);
    });
  }, [mounted, trainer.classes]);

  const completedClasses = (trainer.classes || []).filter((c: any) => c.status === "COMPLETED").length;
  const uniqueMembers = new Set((trainer.classes || []).map((c: any) => c.classBookings?.[0]?.memberId)).size;

  if (!mounted) return null;

  const handleMouseEnter = () => {
    if (!dragReposition.isRepositioning && (formData.photo || trainer.photo)) {
      setPhotoControlsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!dragReposition.isRepositioning) {
      setPhotoControlsVisible(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/trainers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trainer.id, ...formData }),
      });
      const result = await res.json();
      if (result.id) {
        toast.success("Entrenador actualizado");
        setIsEditing(false);
        // We don't necessarily need to reload, just update local trainer if possible
        // but reload is safer for data consistency
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
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await response.json();
      if (data.url) {
        const updates = { photo: data.url, photoPosition: 50 };
        setFormData(prev => ({ ...prev, ...updates }));
        await quickSave(updates);
        toast.success("Foto actualizada");
      } else {
        throw new Error(data.error || "Error al subir");
      }
    } catch (error: any) {
      toast.error(error.message || "No se pudo subir la imagen");
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

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_: string, i: number) => i !== index)
    }));
  };

  const hasPhoto = !!formData.photo;
  const displayPosition = dragReposition.isRepositioning
    ? dragReposition.position
    : (formData.photoPosition ?? 50);

  return (
    <div className="min-h-screen pt-8 md:pt-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Profile Header Card with subtle glassmorphism */}
        <div className="relative mb-8">
          <Card className="bg-secondary/40 backdrop-blur-2xl border-border/10 shadow-2xl overflow-visible">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row gap-8 p-8 items-center md:items-start">
                {/* Avatar Section */}
                <div 
                  className="relative group shrink-0"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div 
                    ref={dragReposition.containerRef}
                    className={cn(
                      "w-40 h-40 rounded-full border shadow-2xl transition-all duration-300 relative overflow-hidden bg-muted/30",
                      dragReposition.isRepositioning 
                        ? "border-primary ring-2 ring-primary/20 scale-105" 
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
                    ) : hasPhoto ? (
                      <img 
                        src={formData.photo} 
                        alt={trainer.fullName}
                        className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 group-hover:scale-110"
                        draggable={false}
                        style={{ objectPosition: `50% ${displayPosition}%` }}
                      />
                    ) : (
                      <Avatar
                        size={160}
                        name={trainer.fullName}
                        variant="beam"
                        colors={["#22c55e", "#10b981", "#059669", "#064e3b", "#0f172a"]}
                      />
                    )}
                    
                    {/* Interaction Overlays */}
                    {!dragReposition.isRepositioning && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]"
                      >
                        <Camera className="w-8 h-8 text-white/90 drop-shadow-lg" />
                      </button>
                    )}

                    {dragReposition.isRepositioning && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                        <Move className="w-8 h-8 text-white animate-bounce drop-shadow-md" />
                      </div>
                    )}
                  </div>

                  {/* Photo Action Bar */}
                  {(dragReposition.isRepositioning || (hasPhoto && photoControlsVisible)) && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/95 backdrop-blur-xl border border-border/20 rounded-full p-1 shadow-2xl z-20 animate-in fade-in zoom-in duration-300">
                      {dragReposition.isRepositioning ? (
                        <>
                          <button
                            onClick={dragReposition.confirmReposition}
                            className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
                            title="Guardar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <div className="w-px h-3 bg-border/50 mx-1" />
                          <button
                            onClick={dragReposition.cancelReposition}
                            className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
                            title="Cambiar foto"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                          <button
                            onClick={dragReposition.enterReposition}
                            className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
                            title="Ajustar posición"
                          >
                            <Move className="w-4 h-4" />
                          </button>
                          <button
                            onClick={deletePhoto}
                            className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadPhoto(file);
                    }}
                  />
                </div>

                {/* Trainer Info Section */}
                <div className="flex-1 w-full flex flex-col gap-6">
                  {isEditing ? (
                    <div className="grid gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Nombre Completo</Label>
                          <Input
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Comisión (%)</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={formData.commissionPct || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, commissionPct: e.target.value ? Number(e.target.value) : null }))}
                              className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl pr-10 transition-all"
                            />
                            <Star className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                          </div>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Email Corporativo</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Teléfono</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl transition-all"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Salario Base ($)</Label>
                          <Input
                            type="number"
                            value={formData.baseSalary || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: e.target.value ? Number(e.target.value) : null }))}
                            className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Pago por Clase ($)</Label>
                          <Input
                            type="number"
                            value={formData.perClassRate || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, perClassRate: e.target.value ? Number(e.target.value) : null }))}
                            className="bg-background/20 border-border/10 focus:border-primary/30 h-12 rounded-xl transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Especialidades</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.specialties.map((spec, i) => (
                            <Badge key={i} className="bg-primary/10 text-primary border-primary/10 px-3 py-1.5 gap-2 transition-all hover:bg-primary/20">
                              {spec}
                              <button onClick={() => removeSpecialty(i)} className="opacity-40 hover:opacity-100 transition-opacity">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Añadir especialidad..."
                            value={newSpecialty}
                            onChange={(e) => setNewSpecialty(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                            className="bg-background/20 border-border/10 focus:border-primary/30 h-11 rounded-xl transition-all"
                          />
                          <Button type="button" variant="outline" onClick={addSpecialty} className="h-11 px-4 border-border/10 hover:bg-primary/10 hover:text-primary rounded-xl">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 text-center md:text-left">
                      <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground drop-shadow-sm">
                          {trainer.fullName}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-primary/80 font-medium tracking-wide">
                          <Activity className="w-4 h-4" />
                          <span className="text-sm uppercase tracking-[0.2em]">Entrenador Certificado</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-8 opacity-70">
                        <div className="flex items-center gap-3 group transition-opacity hover:opacity-100">
                          <Mail className="w-4 h-4 text-primary" />
                          <span className="text-sm font-light">{trainer.email}</span>
                        </div>
                        <div className="flex items-center gap-3 group transition-opacity hover:opacity-100">
                          <Phone className="w-4 h-4 text-primary" />
                          <span className="text-sm font-light">{trainer.phone}</span>
                        </div>
                      </div>

                      {trainer.specialties && trainer.specialties.length > 0 && (
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                          {trainer.specialties.map((spec: string, i: number) => (
                            <Badge key={i} variant="outline" className="border-primary/10 text-primary/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors hover:bg-primary/5">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Button Group */}
                <div className="flex flex-row md:flex-col gap-2 shrink-0 self-center md:self-start">
                  {isEditing ? (
                    <>
                      <Button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="bg-primary text-primary-foreground shadow-xl shadow-primary/20 h-12 px-8 rounded-xl font-bold group"
                      >
                        {isSaving ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />}
                        {isSaving ? "Guardando" : "Guardar"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsEditing(false)} 
                        disabled={isSaving}
                        className="h-12 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={() => setIsEditing(true)} 
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 shadow-lg shadow-primary/5 h-12 px-8 rounded-xl font-bold transition-all duration-300"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar Perfil
                      </Button>
                      <Button variant="ghost" asChild className="h-12 opacity-60 hover:opacity-100 rounded-xl transition-all">
                        <Link href="/trainers">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Volver
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Switcher */}
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
            onClick={() => setActiveTab("PAYROLL")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300",
              activeTab === "PAYROLL" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            Liquidación
          </button>
        </div>

        {activeTab === "GENERAL" ? (
          <>
            {/* Stats Grid - Subtle and Modern */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Clases Semanales", value: classesThisWeek.length, icon: Calendar, color: "text-primary" },
            { label: "Clases Dictadas", value: completedClasses, icon: Trophy, color: "text-primary" },
            { label: "Alumnos Únicos", value: uniqueMembers, icon: Users, color: "text-primary" },
            { label: "Comisión Actual", value: trainer.commissionPct ? `${trainer.commissionPct}%` : "0%", icon: Target, color: "text-primary" },
          ].map((stat, i) => (
            <Card key={i} className="group hover:border-primary/20 transition-all duration-500 border-border/10 bg-secondary/20 backdrop-blur-sm overflow-hidden border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-2.5 rounded-xl bg-background/50 border border-border/20 group-hover:border-primary/40 transition-colors", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <Zap className="w-4 h-4 text-primary opacity-0 group-hover:opacity-20 transition-all duration-700 -translate-y-2 group-hover:translate-y-0" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-light tracking-tighter text-foreground/90">{stat.value}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Section */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          {/* Bio Section */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border/10 shadow-sm bg-secondary/10 group overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Biografía
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Escribe aquí la biografía profesional..."
                    rows={8}
                    className="bg-background/20 border-border/10 focus:border-primary/30 resize-none rounded-xl text-sm leading-relaxed"
                  />
                ) : (
                  <p className="text-foreground/80 leading-relaxed text-sm font-light italic opacity-90 whitespace-pre-wrap">
                    {trainer.bio || "No hay información adicional disponible."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timeline Section */}
          <div className="lg:col-span-8">
            <Card className="border-border/10 shadow-sm bg-secondary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Próximas Sesiones
                </CardTitle>
                <div className="h-px flex-1 mx-6 bg-border/10" />
                <Badge variant="ghost" className="text-[10px] opacity-40">EN TIEMPO REAL</Badge>
              </CardHeader>
              <CardContent>
                {(trainer.classes || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                    <Calendar className="w-10 h-10 mb-4" />
                    <p className="text-xs uppercase tracking-widest">Sin actividad programada</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {(trainer.classes || []).slice(0, 10).map((classItem: any) => (
                      <div 
                        key={classItem.id}
                        className="group flex items-center gap-6 p-4 rounded-xl border border-border/20 bg-background/20 hover:border-primary/30 transition-all duration-300"
                      >
                        <div className="flex flex-col items-center min-w-[48px] border-r border-border/10 pr-6">
                          <span className="text-[10px] font-black text-primary uppercase">{format(new Date(classItem.startTime), "MMM", { locale: es })}</span>
                          <span className="text-xl font-light">{format(new Date(classItem.startTime), "dd")}</span>
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-foreground/90">{classItem.name}</div>
                          <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {format(new Date(classItem.startTime), "HH:mm")}</span>
                            {classItem.location && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {classItem.location}</span>}
                          </div>
                        </div>

                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          classItem.status === "COMPLETED" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
                          classItem.status === "IN_PROGRESS" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" :
                          "bg-primary animate-pulse"
                        )} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
          </>
        ) : (
          <TrainerPayrollTab trainer={trainer} />
        )}

        {/* Branding Footer */}
        <div className="pb-16 text-center opacity-20">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">
            GYMOS ENGINE &bull; EST. 2026 &bull; {trainer.fullName.split(' ')[0]}
          </p>
        </div>
      </div>
    </div>
  );
}