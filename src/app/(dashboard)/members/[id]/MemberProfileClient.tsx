"use client";

import { useState, useEffect, useRef, useMemo, useReducer } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Edit2,
  ArrowLeft,
  Save,
  X,
  Activity,
  Sparkles,
  ShieldCheck,
  KeyRound
} from "lucide-react";
import { enablePortalAccess } from "@/lib/actions/members-actions";
import { assignMemberPin } from "@/lib/actions/checkin-actions";
import { isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MemberProgressTab } from "./MemberProgressTab";
import { MemberStats } from "./MemberStats";
import { MemberActivityHistory } from "./MemberActivityHistory";
import { MemberPlanDetails } from "./MemberPlanDetails";
import { MemberIdentitySection, MemberFormData } from "./MemberIdentitySection";
import { MemberPhotoSection } from "./MemberPhotoSection";
import { useDragReposition } from "@/hooks/use-drag-reposition";

// Main reducer for profile state management

interface ProfileState {
  isEditing: boolean;
  isSaving: boolean;
  isUploading: boolean;
  photoControlsVisible: boolean;
  activeTab: string;
  isLinking: boolean;
  mounted: boolean;
}

type ProfileAction = 
  | { type: "SET_EDITING"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_UPLOADING"; payload: boolean }
  | { type: "SET_PHOTO_CONTROLS"; payload: boolean }
  | { type: "SET_TAB"; payload: string }
  | { type: "SET_LINKING"; payload: boolean }
  | { type: "SET_MOUNTED"; payload: boolean };

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case "SET_EDITING": return { ...state, isEditing: action.payload };
    case "SET_SAVING": return { ...state, isSaving: action.payload };
    case "SET_UPLOADING": return { ...state, isUploading: action.payload };
    case "SET_PHOTO_CONTROLS": return { ...state, photoControlsVisible: action.payload };
    case "SET_TAB": return { ...state, activeTab: action.payload };
    case "SET_LINKING": return { ...state, isLinking: action.payload };
    case "SET_MOUNTED": return { ...state, mounted: action.payload };
    default: return state;
  }
}

export function MemberProfileClient({ member }: { member: any }) {
  const [state, dispatch] = useReducer(profileReducer, {
    isEditing: false,
    isSaving: false,
    isUploading: false,
    photoControlsVisible: false,
    activeTab: "GENERAL",
    isLinking: false,
    mounted: false,
  });
  const { isEditing, isSaving, isUploading, photoControlsVisible, activeTab, isLinking, mounted } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [isAssigningPin, setIsAssigningPin] = useState(false);

  useEffect(() => {
    dispatch({ type: "SET_MOUNTED", payload: true });
  }, []);
  
  const [formData, setFormData] = useState<MemberFormData>({
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

  const handleAssignPin = async () => {
    if (newPin.length < 4 || newPin.length > 6) {
      toast.error("El PIN debe tener entre 4 y 6 números");
      return;
    }
    setIsAssigningPin(true);
    try {
      const res = await assignMemberPin(member.id, newPin);
      if (res.success) {
        toast.success(res.message);
        setPinDialogOpen(false);
        setNewPin("");
        window.location.reload();
      } else {
        toast.error(res.error || "Error al asignar PIN");
      }
    } catch (err) {
      toast.error("Error de conexión al asignar PIN");
    } finally {
      setIsAssigningPin(false);
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
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      const res = await fetch("/api/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, ...formData }),
      });
      const result = await res.json();
      if (result.id) {
        toast.success("Socio actualizado");
        dispatch({ type: "SET_EDITING", payload: false });
        window.location.reload();
      } else {
        toast.error(result.error || "Error al guardar");
      }
    } catch (err) {
      toast.error("Error al guardar");
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  const uploadPhoto = async (file: File) => {
    dispatch({ type: "SET_UPLOADING", payload: true });
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
      dispatch({ type: "SET_UPLOADING", payload: false });
    }
  };

  const deletePhoto = async () => {
    const updates = { photo: "", photoPosition: 50 };
    setFormData(prev => ({ ...prev, ...updates }));
    await quickSave(updates);
    dispatch({ type: "SET_PHOTO_CONTROLS", payload: false });
    toast.success("Foto eliminada");
  };

  const handleEnablePortal = async () => {
    dispatch({ type: "SET_LINKING", payload: true });
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
      dispatch({ type: "SET_LINKING", payload: false });
    }
  };

  const currentMembership = member.memberships?.[0];
  const planName = currentMembership?.plan?.name || "";
  const isVip = /vip|premium/i.test(planName);
  const isStandard = /est[aá]ndar/i.test(planName);
  const isBasic = /b[aá]sico/i.test(planName);
  const hasPlan = !!(planName);
  const attendancesThisMonth = useMemo(() => {
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
                <MemberPhotoSection 
                  member={member}
                  photo={formData.photo}
                  photoPosition={formData.photoPosition}
                  photoControlsVisible={photoControlsVisible}
                  isUploading={isUploading}
                  isVip={isVip}
                  isStandard={isStandard}
                  isBasic={isBasic}
                  displayPosition={displayPosition}
                  dragReposition={dragReposition}
                  fileInputRef={fileInputRef}
                  onPhotoControlsToggle={(v) => dispatch({ type: "SET_PHOTO_CONTROLS", payload: v })}
                  onUpload={uploadPhoto}
                  onDelete={deletePhoto}
                />

                <div className="flex-1 w-full flex flex-col gap-6">
                    <MemberIdentitySection 
                      isEditing={isEditing} 
                      member={member} 
                      formData={formData} 
                      setFormData={setFormData} 
                    />
                </div>

                <div className="flex flex-row md:flex-col gap-2 shrink-0 self-center md:self-start">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground shadow-xl shadow-primary/20 h-12 px-8 rounded-xl font-bold group">
                        {isSaving ? <Activity className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2 transition-transform group-hover:scale-110" />}
                        {isSaving ? "Guardando" : "Guardar"}
                      </Button>
                      <Button variant="ghost" onClick={() => dispatch({ type: "SET_EDITING", payload: false })} disabled={isSaving} className="h-12 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all">
                        <X className="size-4 mr-2" /> Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      {member.status !== 'ACTIVE' && (
                        <Button 
                          onClick={() => {
                            const updates = { status: "ACTIVE" };
                            setFormData(prev => ({ ...prev, ...updates }));
                            quickSave(updates).then(() => window.location.reload());
                          }} 
                          className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 shadow-lg shadow-emerald-500/5 h-12 px-8 rounded-xl font-bold transition-all duration-300"
                        >
                          <ShieldCheck className="size-4 mr-2" /> Reactivar Socio
                        </Button>
                      )}
                      
                      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-white/10 hover:bg-white/5 h-12 px-6 rounded-xl font-bold transition-all duration-300 shadow-sm">
                            <KeyRound className="size-4 mr-2 text-primary" />
                            {member.pin ? "Cambiar PIN Kiosco" : "Asignar PIN Kiosco"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card bg-zinc-950/95 backdrop-blur-2xl border-white/10 max-w-sm p-6 rounded-2xl shadow-2xl">
                          <DialogHeader>
                            <DialogTitle className="font-serif text-xl flex items-center gap-2 text-foreground">
                              <KeyRound className="size-5 text-primary" />
                              PIN de Kiosco
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-2">
                            <p className="text-xs text-white/70 leading-relaxed">
                              Asigna un código de 4 a 6 dígitos para que <strong className="text-white">{member.fullName}</strong> pueda hacer check-in rápidamente desde el Kiosco.
                            </p>
                            <div className="space-y-2">
                              <Label className="text-[10px] uppercase tracking-widest text-white/60 font-bold ml-1">Código PIN Numérico</Label>
                              <Input
                                type="password"
                                maxLength={6}
                                placeholder="Ej: 12345"
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                className="bg-white/5 border-white/10 h-12 rounded-xl text-center font-mono tracking-[0.5em] text-xl placeholder:tracking-normal placeholder:text-xs"
                              />
                            </div>
                            <Button 
                              onClick={handleAssignPin} 
                              disabled={isAssigningPin || newPin.length < 4}
                              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all duration-300"
                            >
                              {isAssigningPin ? <Activity className="size-4 mr-2 animate-spin" /> : null}
                              {isAssigningPin ? "Guardando..." : "Guardar PIN"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button onClick={() => dispatch({ type: "SET_EDITING", payload: true })} className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 shadow-lg shadow-primary/5 h-12 px-8 rounded-xl font-bold transition-all duration-300">
                        <Edit2 className="size-4 mr-2" /> Editar Perfil
                      </Button>
                      
                      {member.userId ? (
                        <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase font-bold tracking-widest shadow-lg shadow-emerald-500/5 animate-in fade-in zoom-in">
                          <ShieldCheck className="size-3.5 h-3.5" />
                          Acceso Habilitado
                        </div>
                      ) : (
                        <Button 
                          onClick={handleEnablePortal} 
                          disabled={isLinking}
                          className="bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground border border-accent/20 shadow-lg shadow-accent/5 h-12 px-8 rounded-xl font-bold transition-all duration-300 animate-in fade-in slide-in-from-right-4"
                        >
                          {isLinking ? <Activity className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2" />}
                          Habilitar Portal
                        </Button>
                      )}

                      <Button variant="ghost" asChild className="h-12 opacity-60 hover:opacity-100 rounded-xl transition-all">
                        <Link href="/members"><ArrowLeft className="size-4 mr-2" /> Volver</Link>
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
            onClick={() => dispatch({ type: "SET_TAB", payload: "GENERAL" })}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300",
              activeTab === "GENERAL" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            Información General
          </button>
          <button
            onClick={() => dispatch({ type: "SET_TAB", payload: "PROGRESS" })}
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
            <MemberStats 
              attendancesThisMonth={attendancesThisMonth} 
              currentMembership={currentMembership} 
              lastWeight={member.bodyMetrics?.[0]?.weight} 
            />

        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          {/* Recent Activity */}
          <div className="lg:col-span-7">
            <MemberActivityHistory attendances={member.attendances || []} />
          </div>

            <MemberPlanDetails member={member} currentMembership={currentMembership} />
        </div>
          </>
        ) : (
          <MemberProgressTab member={member} />
        )}
      </div>
    </div>
  );
}
