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
import { enablePortalAccess, disablePortalAccess } from "@/lib/actions/members-actions";
import { assignMemberPin } from "@/lib/actions/checkin-actions";
import { isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MemberProgressTab } from "./MemberProgressTab";
import { MemberRoutineTab } from "./MemberRoutineTab";
import { MemberPaymentsTab } from "./MemberPaymentsTab";
import { MemberStats } from "./MemberStats";
import { MemberActivityHistory } from "./MemberActivityHistory";
import { MemberPlanDetails } from "./MemberPlanDetails";
import { MemberIdentitySection, MemberFormData } from "./MemberIdentitySection";
import { MemberPhotoSection } from "./MemberPhotoSection";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDragReposition } from "@/hooks/use-drag-reposition";
import { User, TrendingUp, Dumbbell, Receipt } from "lucide-react";

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

  const [isPhotoDeleteOpen, setIsPhotoDeleteOpen] = useState(false);
  const [isPhotoDeleteLoading, setIsPhotoDeleteLoading] = useState(false);

  const [isPortalRevokeOpen, setIsPortalRevokeOpen] = useState(false);
  const [isPortalRevokeLoading, setIsPortalRevokeLoading] = useState(false);

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
      if (!res.ok) {
        toast.error("Error en la respuesta del servidor");
        return;
      }
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
      if (!response.ok) {
        toast.error("Error al subir el archivo");
        return;
      }
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

  const deletePhoto = () => {
    setIsPhotoDeleteOpen(true);
  };

  const deletePhotoConfirm = async () => {
    setIsPhotoDeleteLoading(true);
    try {
      const updates = { photo: "", photoPosition: 50 };
      setFormData(prev => ({ ...prev, ...updates }));
      await quickSave(updates);
      dispatch({ type: "SET_PHOTO_CONTROLS", payload: false });
      toast.success("Foto eliminada correctamente");
      setIsPhotoDeleteOpen(false);
    } catch (error) {
      toast.error("Error al intentar eliminar la foto");
    } finally {
      setIsPhotoDeleteLoading(false);
    }
  };

  const handleDisablePortal = async () => {
    setIsPortalRevokeLoading(true);
    try {
      const res = await disablePortalAccess(member.id);
      if (res.success) {
        toast.success(res.message);
        setIsPortalRevokeOpen(false);
        window.location.reload();
      } else {
        toast.error(res.error || "Error al revocar acceso");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsPortalRevokeLoading(false);
    }
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
    <div className="w-full space-y-8 animate-fade-in-fast">
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
                  tier={isVip ? "vip" : isStandard ? "standard" : isBasic ? "basic" : "none"}
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
                      <Button variant="ghost" onClick={() => dispatch({ type: "SET_EDITING", payload: false })} disabled={isSaving} className="h-12 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors">
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
                          className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 shadow-lg shadow-emerald-500/5 h-12 px-8 rounded-xl font-bold transition-colors duration-300"
                        >
                          <ShieldCheck className="size-4 mr-2" /> Reactivar Socio
                        </Button>
                      )}
                      
                      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-white/10 hover:bg-white/5 h-12 px-6 rounded-xl font-bold transition-colors duration-300 shadow-sm">
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
                              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-colors duration-300"
                            >
                              {isAssigningPin ? <Activity className="size-4 mr-2 animate-spin" /> : null}
                              {isAssigningPin ? "Guardando..." : "Guardar PIN"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button onClick={() => dispatch({ type: "SET_EDITING", payload: true })} className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 shadow-lg shadow-primary/5 h-12 px-8 rounded-xl font-bold transition-colors duration-300">
                        <Edit2 className="size-4 mr-2" /> Editar Perfil
                      </Button>
                      
                      {member.userId ? (
                        <Button
                          variant="outline"
                          onClick={() => setIsPortalRevokeOpen(true)}
                          disabled={isPortalRevokeLoading}
                          className="group/btn relative overflow-hidden bg-emerald-500/10 border-emerald-500/20 hover:bg-destructive/10 hover:border-destructive/20 text-emerald-500 hover:text-destructive h-12 px-6 rounded-xl font-bold transition-colors duration-300 animate-slide-right-fast"
                        >
                          <span className="flex items-center gap-2 group-hover/btn:opacity-0 transition-colors duration-200">
                            <ShieldCheck className="size-4 text-emerald-500" />
                            <span>Acceso Habilitado</span>
                          </span>
                          <span className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover/btn:opacity-100 transition-colors duration-200 text-destructive">
                            <X className="size-4 text-destructive" />
                            <span>Revocar Acceso</span>
                          </span>
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleEnablePortal} 
                          disabled={isLinking}
                          className="bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground border border-accent/20 shadow-lg shadow-accent/5 h-12 px-8 rounded-xl font-bold transition-colors duration-300 animate-slide-right-fast"
                        >
                          {isLinking ? <Activity className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2" />}
                          Habilitar Portal
                        </Button>
                      )}

                      <Button variant="ghost" asChild className="h-12 opacity-60 hover:opacity-100 rounded-xl transition-opacity">
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
        <div className="flex flex-wrap bg-background/50 backdrop-blur-xl p-1.5 rounded-2xl w-fit mb-8 border border-white/10 gap-1">
          <button type="button"
            onClick={() => dispatch({ type: "SET_TAB", payload: "GENERAL" })}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2",
              activeTab === "GENERAL"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <User className="size-3.5" />
            Expediente & Membresía
          </button>
          <button type="button"
            onClick={() => dispatch({ type: "SET_TAB", payload: "PROGRESS" })}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2",
              activeTab === "PROGRESS"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <TrendingUp className="size-3.5" />
            Progreso Físico
          </button>
          <button type="button"
            onClick={() => dispatch({ type: "SET_TAB", payload: "ROUTINE" })}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2",
              activeTab === "ROUTINE"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Dumbbell className="size-3.5" />
            Rutina Prescrita
          </button>
          <button type="button"
            onClick={() => dispatch({ type: "SET_TAB", payload: "PAYMENTS" })}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2",
              activeTab === "PAYMENTS"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Receipt className="size-3.5" />
            Historial de Pagos
          </button>
        </div>

        {activeTab === "GENERAL" && (
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
        )}

        {activeTab === "PROGRESS" && <MemberProgressTab member={member} />}
        {activeTab === "ROUTINE" && <MemberRoutineTab member={member} />}
        {activeTab === "PAYMENTS" && <MemberPaymentsTab member={member} />}

      <ConfirmDialog
        isOpen={isPhotoDeleteOpen}
        onOpenChange={setIsPhotoDeleteOpen}
        onConfirm={deletePhotoConfirm}
        title="Eliminar Foto de Perfil"
        description="¿Estás seguro de que deseas eliminar la foto de perfil de este socio? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isPhotoDeleteLoading}
      />

      <ConfirmDialog
        isOpen={isPortalRevokeOpen}
        onOpenChange={setIsPortalRevokeOpen}
        onConfirm={handleDisablePortal}
        title="Revocar Acceso al Portal"
        description="¿Estás seguro de que deseas revocar el acceso al portal de este socio? Su cuenta de usuario será eliminada/desactivada y no podrá volver a iniciar sesión hasta que se le habilite el acceso nuevamente."
        confirmText="Revocar Acceso"
        cancelText="Mantener Acceso"
        variant="danger"
        isLoading={isPortalRevokeLoading}
      />
    </div>
  );
}
