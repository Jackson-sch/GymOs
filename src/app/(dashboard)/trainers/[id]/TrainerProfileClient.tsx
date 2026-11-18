"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { TrainerPayrollTab } from "./TrainerPayrollTab";
import { TrainerRoutinesTab } from "./TrainerRoutinesTab";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

// New Component Imports
import { PhotoManager } from "./components/PhotoManager";
import { ProfileInfo } from "./components/ProfileInfo";
import { TrainerStats } from "./components/TrainerStats";
import { BioSection } from "./components/BioSection";
import { SessionTimeline } from "./components/SessionTimeline";
import { TrainerProfileHeader } from "./components/TrainerProfileHeader";
import { ClassDetailsDialog } from "../../classes/components/ClassDetailsDialog";

// ─── Facebook-style drag-to-reposition hook ────────────────────────────────
function useDragReposition(
  initialPosition: number,
  onCommit: (pos: number) => void,
) {
  const [isRepositioning, setIsRepositioning] = React.useState(false);
  const [position, setPosition] = React.useState(initialPosition);
  const [savedPosition, setSavedPosition] = React.useState(initialPosition);
  const isDragging = React.useRef(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startY = React.useRef(0);
  const startPos = React.useRef(0);

  const enterReposition = () => {
    setSavedPosition(position);
    setIsRepositioning(true);
  };

  const cancelReposition = () => {
    setPosition(savedPosition);
    setIsRepositioning(false);
  };

  const confirmReposition = () => {
    setIsRepositioning(false);
    onCommit(position);
  };

  const handleMove = (clientY: number) => {
    if (!isDragging.current || !containerRef.current) return;
    const deltaY = clientY - startY.current;
    const containerHeight = containerRef.current.offsetHeight;
    const movementPercent = (deltaY / containerHeight) * 100;
    
    // Reverse movement for intuitive dragging (drag up -> image moves up)
    let newPos = startPos.current - movementPercent;
    newPos = Math.max(0, Math.min(100, newPos));
    setPosition(newPos);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!isRepositioning) return;
    isDragging.current = true;
    startY.current = e.clientY;
    startPos.current = position;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isRepositioning) return;
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    startPos.current = position;
  };

  const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);
  const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);

  const onMouseUp = () => { isDragging.current = false; };

  React.useEffect(() => {
    if (isDragging.current) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging.current, position]);

  return {
    isRepositioning,
    position,
    containerRef,
    enterReposition,
    cancelReposition,
    confirmReposition,
    onMouseDown,
    onTouchStart,
    onTouchMove: (e: React.TouchEvent) => handleMove(e.touches[0].clientY),
    onTouchEnd: () => { isDragging.current = false; },
  };
}

// ─── State Reducer ──────────────────────────────────────────────────────────
type TrainerState = {
  isEditing: boolean;
  isSaving: boolean;
  isUploading: boolean;
  photoControlsVisible: boolean;
  activeTab: "GENERAL" | "PAYROLL" | "ROUTINES";
  newSpecialty: string;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    bio: string;
    specialties: string[];
    photo: string | null;
    photoPosition: number;
    baseSalary: number | null;
    perClassRate: number | null;
    commissionPct: number | null;
    dni: string;
  };
  selectedClassId: string | null;
};

type Action =
  | { type: "TOGGLE_EDIT" }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_UPLOADING"; payload: boolean }
  | { type: "SET_PHOTO_CONTROLS"; payload: boolean }
  | { type: "SET_TAB"; payload: "GENERAL" | "PAYROLL" | "ROUTINES" }
  | { type: "UPDATE_FORM"; payload: Partial<TrainerState["formData"]> }
  | { type: "SET_NEW_SPECIALTY"; payload: string }
  | { type: "SET_SELECTED_CLASS"; payload: string | null }
  | { type: "ADD_SPECIALTY" }
  | { type: "REMOVE_SPECIALTY"; payload: number }
  | { type: "RESET_FORM"; payload: TrainerState["formData"] };

function trainerReducer(state: TrainerState, action: Action): TrainerState {
  switch (action.type) {
    case "TOGGLE_EDIT":
      return { ...state, isEditing: !state.isEditing };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_UPLOADING":
      return { ...state, isUploading: action.payload };
    case "SET_PHOTO_CONTROLS":
      return { ...state, photoControlsVisible: action.payload };
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    case "UPDATE_FORM":
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case "SET_NEW_SPECIALTY":
      return { ...state, newSpecialty: action.payload };
    case "ADD_SPECIALTY":
      if (!state.newSpecialty.trim()) return state;
      return {
        ...state,
        formData: {
          ...state.formData,
          specialties: [...state.formData.specialties, state.newSpecialty.trim()],
        },
        newSpecialty: "",
      };
    case "REMOVE_SPECIALTY":
      return {
        ...state,
        formData: {
          ...state.formData,
          specialties: state.formData.specialties.filter((_, i) => i !== action.payload),
        },
      };
    case "RESET_FORM":
      return { ...state, formData: action.payload, isEditing: false };
    case "SET_SELECTED_CLASS":
      return { ...state, selectedClassId: action.payload };
    default:
      return state;
  }
}

interface TrainerProfileClientProps {
  trainer: any;
}

export default function TrainerProfileClient({
  trainer,
}: TrainerProfileClientProps) {
  // Derive statistics from trainer data
  const { classesThisWeek, completedClasses, uniqueMembers } = React.useMemo(() => {
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    const classes = trainer.classes || [];
    
    const weekClasses = classes.filter((c: any) => 
      new Date(c.startTime) >= startOfThisWeek
    );

    const completed = classes.filter((c: any) => 
      c.status === "COMPLETED" || new Date(c.endTime) < now
    ).length;

    const memberIds = new Set();
    classes.forEach((c: any) => {
      c.bookings?.forEach((b: any) => memberIds.add(b.memberId));
    });

    return {
      classesThisWeek: weekClasses,
      completedClasses: completed,
      uniqueMembers: memberIds.size
    };
  }, [trainer.classes]);

  const [state, dispatch] = React.useReducer(trainerReducer, {
    isEditing: false,
    isSaving: false,
    isUploading: false,
    photoControlsVisible: false,
    activeTab: "GENERAL",
    newSpecialty: "",
    formData: {
      fullName: trainer.fullName || "",
      email: trainer.email || "",
      phone: trainer.phone || "",
      bio: trainer.bio || "",
      specialties: trainer.specialties || [],
      photo: trainer.photo || null,
      photoPosition: trainer.photoPosition ?? 50,
      baseSalary: trainer.baseSalary ? Number(trainer.baseSalary) : null,
      perClassRate: trainer.perClassRate ? Number(trainer.perClassRate) : null,
      commissionPct: trainer.commissionPct ? Number(trainer.commissionPct) : null,
      dni: trainer.dni || "",
    },
    selectedClassId: null,
  });

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const [isPhotoDeleteOpen, setIsPhotoDeleteOpen] = React.useState(false);
  const [isPhotoDeleteLoading, setIsPhotoDeleteLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Sincronizar datos cuando el prop 'trainer' cambia desde el servidor
  React.useEffect(() => {
    dispatch({ 
      type: "UPDATE_FORM", 
      payload: {
        fullName: trainer.fullName || "",
        email: trainer.email || "",
        phone: trainer.phone || "",
        bio: trainer.bio || "",
        specialties: trainer.specialties || [],
        photo: trainer.photo || null,
        photoPosition: trainer.photoPosition ?? 50,
        baseSalary: trainer.baseSalary ? Number(trainer.baseSalary) : null,
        perClassRate: trainer.perClassRate ? Number(trainer.perClassRate) : null,
        commissionPct: trainer.commissionPct ? Number(trainer.commissionPct) : null,
        dni: trainer.dni || "",
      } 
    });
  }, [trainer]);

  const { isEditing, isSaving, isUploading, photoControlsVisible, activeTab, newSpecialty, formData, selectedClassId } = state;

  const dragReposition = useDragReposition(formData.photoPosition ?? 50, (pos) => {
    dispatch({ type: "UPDATE_FORM", payload: { photoPosition: pos } });
  });

  const handleSave = async (dataToSave = formData) => {
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      const res = await fetch(`/api/trainers?id=${trainer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al guardar");
      }
      
      toast.success("Perfil actualizado");
      router.refresh(); // Solicitar nuevos datos al servidor
      if (isEditing) dispatch({ type: "TOGGLE_EDIT" });
    } catch (error: any) {
      toast.error(error.message || "Error al guardar los cambios");
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  const uploadPhoto = async (file: File) => {
    dispatch({ type: "SET_UPLOADING", payload: true });
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      if (!res.ok) {
        toast.error("Error al subir el archivo");
        return;
      }
      const data = await res.json();
      if (data.url) {
        dispatch({ type: "UPDATE_FORM", payload: { photo: data.url } });
        await handleSave({ ...formData, photo: data.url });
      }
    } catch (error) {
      toast.error("Error al subir la imagen");
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
      dispatch({ type: "UPDATE_FORM", payload: { photo: null } });
      await handleSave({ ...formData, photo: null });
      toast.success("Foto de perfil eliminada");
      setIsPhotoDeleteOpen(false);
    } catch (error) {
      toast.error("Error al eliminar la foto");
    } finally {
      setIsPhotoDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen selection:bg-primary/20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] size-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="w-full relative space-y-6 pb-12">
        {/* Breadcrumb + Horizontal Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <Link
              href="/trainers"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 border border-border hover:border-primary/40 hover:text-foreground transition-colors font-medium shrink-0"
            >
              <ArrowLeft className="size-3.5" />
              <span>Entrenadores</span>
            </Link>
            <span className="opacity-40">/</span>
            <span className="truncate font-semibold text-foreground">{trainer.fullName}</span>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_EDIT" })}
              className="inline-flex items-center justify-center gap-2 px-5 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-bold uppercase tracking-wider shadow-md shadow-primary/20 self-start sm:self-auto"
            >
              <Edit2 className="size-3.5" />
              Editar Perfil
            </button>
          )}
        </div>

        {/* Unified Hero Split Card + Integrated Tabs */}
        <div className="relative animate-enter">
          <div className="relative rounded-3xl border border-border glass-card backdrop-blur-2xl overflow-hidden shadow-xl">
            <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-6 p-6 md:p-8">
              {/* Left: Photo + Profile Info */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 flex-1 min-w-0 w-full">
                <PhotoManager
                  formData={formData}
                  isUploading={isUploading}
                  photoControlsVisible={photoControlsVisible}
                  dragReposition={dragReposition}
                  fileInputRef={fileInputRef}
                  dispatch={dispatch}
                  fullName={trainer.fullName}
                  deletePhoto={deletePhoto}
                  uploadPhoto={uploadPhoto}
                />

                <div className="flex-1 min-w-0 w-full">
                  <ProfileInfo
                    isEditing={isEditing}
                    formData={formData}
                    newSpecialty={newSpecialty}
                    trainer={trainer}
                    dispatch={dispatch}
                    isSaving={isSaving}
                    onSave={() => handleSave()}
                    onCancel={() =>
                      dispatch({
                        type: "RESET_FORM",
                        payload: {
                          fullName: trainer.fullName || "",
                          email: trainer.email || "",
                          phone: trainer.phone || "",
                          dni: trainer.dni || "",
                          bio: trainer.bio || "",
                          specialties: trainer.specialties || [],
                          photo: trainer.photo || null,
                          photoPosition: trainer.photoPosition ?? 50,
                          baseSalary: trainer.baseSalary ? Number(trainer.baseSalary) : null,
                          perClassRate: trainer.perClassRate ? Number(trainer.perClassRate) : null,
                          commissionPct: trainer.commissionPct ? Number(trainer.commissionPct) : null,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Right: Integrated Compensation Summary Card */}
              {!isEditing && (
                <div className="w-full lg:w-76 shrink-0 rounded-2xl bg-muted/50 border border-border p-5 flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Esquema de Compensación
                    </p>
                    <p className="text-lg font-serif font-semibold text-foreground mt-0.5">
                      {trainer.baseSalary ? `S/ ${Number(trainer.baseSalary).toLocaleString()} base` : "Por clases & comisión"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-card/80 border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Por Clase</p>
                      <p className="font-mono font-bold text-foreground mt-0.5">
                        S/ {trainer.perClassRate ? Number(trainer.perClassRate) : 0}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card/80 border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Comisión</p>
                      <p className="font-mono font-bold text-primary mt-0.5">
                        {trainer.commissionPct ? Number(trainer.commissionPct) : 10}%
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_TAB", payload: "PAYROLL" })}
                    className="w-full h-9 rounded-xl border border-border bg-card/80 hover:border-primary/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 text-foreground transition-colors"
                  >
                    <Wallet className="size-3.5 text-primary" />
                    Ver Nómina & Pagos
                  </button>
                </div>
              )}
            </div>

            {/* Integrated Tab Switcher */}
            <TrainerProfileHeader
              activeTab={activeTab}
              onTabChange={(tab) => dispatch({ type: "SET_TAB", payload: tab })}
            />
          </div>
        </div>

        {activeTab === "GENERAL" && (
          <div className="space-y-6">
            <TrainerStats
              classesThisWeek={classesThisWeek}
              completedClasses={completedClasses}
              uniqueMembers={uniqueMembers}
              commissionPct={trainer.commissionPct}
            />

            <div className="grid lg:grid-cols-12 gap-6">
              <BioSection
                isEditing={isEditing}
                bio={formData.bio}
                dispatch={dispatch}
              />

              <SessionTimeline
                classes={trainer.classes}
                mounted={mounted}
                onSelectClass={(id) => dispatch({ type: "SET_SELECTED_CLASS", payload: id })}
              />
            </div>
          </div>
        )}

        {activeTab === "ROUTINES" && <TrainerRoutinesTab trainer={trainer} />}
        {activeTab === "PAYROLL" && <TrainerPayrollTab trainer={trainer} />}

        <ClassDetailsDialog 
          classId={selectedClassId}
          onClose={() => dispatch({ type: "SET_SELECTED_CLASS", payload: null })}
        />

        {/* Photo Deletion Confirm Dialog */}
        <ConfirmDialog
          isOpen={isPhotoDeleteOpen}
          onOpenChange={setIsPhotoDeleteOpen}
          onConfirm={deletePhotoConfirm}
          title="¿Eliminar foto de perfil?"
          description="Esta acción eliminará la imagen actual de tu perfil del staff técnico. Podrás subir una nueva imagen en cualquier momento."
          confirmText="Eliminar Foto"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isPhotoDeleteLoading}
        />

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