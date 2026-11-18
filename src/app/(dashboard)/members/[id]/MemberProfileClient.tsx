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
import { isAfter, isBefore, startOfMonth, endOfMonth, differenceInCalendarDays, format } from "date-fns";
import { es } from "date-fns/locale";
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
import { MemberPinDialog } from "./MemberPinDialog";
import { MemberProfileTabNav } from "./MemberProfileTabNav";
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

  const membershipCycle = useMemo(() => {
    if (!mounted || !currentMembership?.endDate) {
      return { daysRemaining: null as number | null, progress: 0, isExpired: false };
    }
    const now = new Date();
    const end = new Date(currentMembership.endDate);
    const start = currentMembership.startDate ? new Date(currentMembership.startDate) : now;
    const totalDays = Math.max(1, differenceInCalendarDays(end, start));
    const elapsedDays = Math.max(0, differenceInCalendarDays(now, start));
    const daysRemaining = differenceInCalendarDays(end, now);
    const progress = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
    return { daysRemaining, progress, isExpired: daysRemaining < 0 };
  }, [mounted, currentMembership]);

  const displayPosition = dragReposition.isRepositioning ? dragReposition.position : (formData.photoPosition ?? 50);

  if (!mounted) return null;

  return (
    <div className="w-full space-y-6 animate-fade-in-fast pb-12">
      {/* Breadcrumb + Horizontal Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          <Link
            href="/members"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 border border-border hover:border-primary/40 hover:text-foreground transition-colors font-medium shrink-0"
          >
            <ArrowLeft className="size-3.5" />
            <span>Miembros</span>
          </Link>
          <span className="opacity-40">/</span>
          <span className="truncate font-semibold text-foreground">{member.fullName}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => dispatch({ type: "SET_EDITING", payload: false })}
                disabled={isSaving}
                className="h-10 rounded-xl border-border hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-4 mr-1.5" /> Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary text-primary-foreground shadow-md shadow-primary/20 h-10 px-5 rounded-xl font-bold"
              >
                {isSaving ? <Activity className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </>
          ) : (
            <>
              {member.status !== "ACTIVE" && (
                <Button
                  onClick={() => {
                    const updates = { status: "ACTIVE" };
                    setFormData((prev) => ({ ...prev, ...updates }));
                    quickSave(updates).then(() => window.location.reload());
                  }}
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/25 h-10 px-4 rounded-xl font-bold text-xs"
                >
                  <ShieldCheck className="size-4 mr-1.5" /> Reactivar
                </Button>
              )}

              <MemberPinDialog
                member={member}
                open={pinDialogOpen}
                onOpenChange={setPinDialogOpen}
                newPin={newPin}
                onPinChange={setNewPin}
                onAssignPin={handleAssignPin}
                isAssigningPin={isAssigningPin}
              />

              {member.userId ? (
                <Button
                  variant="outline"
                  onClick={() => setIsPortalRevokeOpen(true)}
                  disabled={isPortalRevokeLoading}
                  className="group/btn relative overflow-hidden bg-emerald-500/10 border-emerald-500/25 hover:bg-destructive/10 hover:border-destructive/30 text-emerald-600 dark:text-emerald-400 hover:text-destructive h-10 px-4 rounded-xl font-bold text-xs transition-colors"
                >
                  <span className="flex items-center gap-1.5 group-hover/btn:opacity-0 transition-opacity">
                    <ShieldCheck className="size-3.5" />
                    <span>Acceso Habilitado</span>
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 group-hover/btn:opacity-100 transition-opacity text-destructive">
                    <X className="size-3.5" />
                    <span>Revocar Acceso</span>
                  </span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleEnablePortal}
                  disabled={isLinking}
                  className="bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground border-accent/25 h-10 px-4 rounded-xl font-bold text-xs"
                >
                  {isLinking ? <Activity className="size-3.5 mr-1.5 animate-spin" /> : <Sparkles className="size-3.5 mr-1.5" />}
                  Habilitar Portal
                </Button>
              )}

              <Button
                onClick={() => dispatch({ type: "SET_EDITING", payload: true })}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 h-10 px-5 rounded-xl font-bold text-xs"
              >
                <Edit2 className="size-3.5 mr-1.5" /> Editar Perfil
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hero Split Card + Integrated Tabs */}
      <Card className="glass-card border-border shadow-xl overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row gap-6 p-6 md:p-8 items-center lg:items-stretch justify-between">
            {/* Left: Photo + Identity */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start flex-1 min-w-0 w-full">
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

              <div className="flex-1 min-w-0 w-full flex flex-col justify-center">
                <MemberIdentitySection
                  isEditing={isEditing}
                  member={member}
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>
            </div>

            {/* Right: Integrated Membership Pass Card */}
            {!isEditing && (
              <div className="w-full lg:w-80 shrink-0 rounded-2xl bg-muted/50 border border-border p-5 flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Pase de Membresía
                    </p>
                    <p className="text-lg font-serif font-semibold text-foreground truncate mt-0.5">
                      {hasPlan ? planName : "Sin Plan Activo"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0",
                      !hasPlan
                        ? "bg-muted text-muted-foreground border-border"
                        : membershipCycle.isExpired
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
                    )}
                  >
                    {!hasPlan ? "Sin Plan" : membershipCycle.isExpired ? "Vencido" : "Vigente"}
                  </span>
                </div>

                {hasPlan && currentMembership?.endDate ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Vence {format(new Date(currentMembership.endDate), "dd MMM yyyy", { locale: es })}
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {membershipCycle.daysRemaining !== null && membershipCycle.daysRemaining >= 0
                          ? `${membershipCycle.daysRemaining}d rest.`
                          : `Hace ${Math.abs(membershipCycle.daysRemaining ?? 0)}d`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          membershipCycle.isExpired ? "bg-rose-500" : "bg-primary",
                        )}
                        style={{ width: `${membershipCycle.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Asigna un plan o registra un pago para habilitar el pase.
                  </p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: "SET_TAB", payload: "PAYMENTS" })}
                  className="w-full h-9 rounded-xl border-border bg-card/80 hover:border-primary/40 text-xs font-bold uppercase tracking-wider"
                >
                  <Receipt className="size-3.5 mr-1.5 text-primary" />
                  Ver Pagos y Renovación
                </Button>
              </div>
            )}
          </div>

          {/* Integrated Tab Switcher */}
          <MemberProfileTabNav
            activeTab={activeTab}
            onTabChange={(tab) => dispatch({ type: "SET_TAB", payload: tab })}
          />
        </CardContent>
      </Card>

      {activeTab === "GENERAL" && (
        <div className="space-y-6">
          <MemberStats
            attendancesThisMonth={attendancesThisMonth}
            currentMembership={currentMembership}
            lastWeight={member.bodyMetrics?.[0]?.weight}
          />

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <MemberActivityHistory attendances={member.attendances || []} />
            </div>

            <MemberPlanDetails member={member} currentMembership={currentMembership} />
          </div>
        </div>
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
