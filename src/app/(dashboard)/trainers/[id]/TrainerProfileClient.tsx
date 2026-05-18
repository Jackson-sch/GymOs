"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowLeft,
  Edit2,
  Save,
  X,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { TrainerPayrollTab } from "./TrainerPayrollTab";

// New Component Imports
import { PhotoManager } from "./components/PhotoManager";
import { ProfileInfo } from "./components/ProfileInfo";
import { TrainerStats } from "./components/TrainerStats";
import { BioSection } from "./components/BioSection";
import { SessionTimeline } from "./components/SessionTimeline";
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
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseUp);
    };
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
  activeTab: "GENERAL" | "PAYROLL";
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
  | { type: "SET_TAB"; payload: "GENERAL" | "PAYROLL" }
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  const dragReposition = useDragReposition(
    formData.photoPosition,
    (newPos) => {
      dispatch({ type: "UPDATE_FORM", payload: { photoPosition: newPos } });
      handleSave({ ...formData, photoPosition: newPos });
    }
  );

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

  const deletePhoto = async () => {
    if (!confirm("¿Eliminar foto de perfil?")) return;
    dispatch({ type: "UPDATE_FORM", payload: { photo: null } });
    await handleSave({ ...formData, photo: null });
  };

  return (
    <div className="min-h-screen selection:bg-primary/20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] size-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">
            <Link 
              href="/trainers" 
              className="size-10 flex items-center justify-center rounded-full border border-border/10 bg-secondary/20 hover:bg-secondary/40 transition-all hover:scale-110 group"
            >
              <ArrowLeft className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Dashboard</span>
                <div className="size-1 rounded-full bg-border/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Entrenador</span>
              </div>
              <h2 className="text-xl font-light tracking-tight">Gestión de Personal</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: "SET_TAB", payload: "GENERAL" })}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === "GENERAL" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary/40 text-muted-foreground"
              )}
            >
              General
            </button>
            <button
              onClick={() => dispatch({ type: "SET_TAB", payload: "PAYROLL" })}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === "PAYROLL" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary/40 text-muted-foreground"
              )}
            >
              Payroll
            </button>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="relative mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent blur-3xl opacity-20" />
          <div className="relative rounded-[2.5rem] border border-border/10 bg-secondary/10 backdrop-blur-xl overflow-hidden">
            {/* Top accent line */}
            <div className="h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
            
            {/* Action Controls - Top Bar */}
            <div className="flex items-center justify-end gap-2 px-8 pt-6 pb-0">
              {!isEditing ? (
                <button
                  onClick={() => dispatch({ type: "TOGGLE_EDIT" })}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-background/40 backdrop-blur-md border border-border/10 hover:bg-background/60 text-muted-foreground hover:text-foreground transition-all text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Edit2 className="size-3.5" />
                  Editar Perfil
                </button>
              ) : null}
            </div>

            {/* Profile Content */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 p-10 pt-6">
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

              <ProfileInfo 
                isEditing={isEditing}
                formData={formData}
                newSpecialty={newSpecialty}
                trainer={trainer}
                dispatch={dispatch}
                isSaving={isSaving}
                onSave={() => handleSave()}
                onCancel={() => dispatch({ type: "RESET_FORM", payload: {
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
                } })}
              />
            </div>
          </div>
        </div>

        {activeTab === "GENERAL" ? (
          <>
            {/* Stats Grid - Subtle and Modern */}
            <TrainerStats
              classesThisWeek={classesThisWeek}
              completedClasses={completedClasses}
              uniqueMembers={uniqueMembers}
              commissionPct={trainer.commissionPct}
            />

            {/* Content Section */}
            <div className="grid lg:grid-cols-12 gap-8 mb-16">
              {/* Bio Section */}
              <BioSection
                isEditing={isEditing}
                bio={formData.bio}
                dispatch={dispatch}
              />

              {/* Timeline Section */}
              <SessionTimeline 
                classes={trainer.classes}
                mounted={mounted}
                onSelectClass={(id) => dispatch({ type: "SET_SELECTED_CLASS", payload: id })}
              />
            </div>
          </>
        ) : (
          <TrainerPayrollTab trainer={trainer} />
        )}

        <ClassDetailsDialog 
          classId={selectedClassId}
          onClose={() => dispatch({ type: "SET_SELECTED_CLASS", payload: null })}
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