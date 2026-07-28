"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Check, 
  X, 
  Edit2
} from "lucide-react";
import { toast } from "sonner";
import { updatePortalMemberProfileAction } from "@/lib/actions/portal-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PortalProfileAvatarCard } from "./components/PortalProfileAvatarCard";
import { PersonalInfoFormSection } from "./components/PersonalInfoFormSection";
import { EmergencyContactFormSection } from "./components/EmergencyContactFormSection";

interface PortalProfileClientProps {
  member: any;
  user: any;
}

export default function PortalProfileClient({ member: initialMember, user: initialUser }: PortalProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDeletePhotoOpen, setIsDeletePhotoOpen] = useState(false);
  const [deletePhotoLoading, setDeletePhotoLoading] = useState(false);

  // States
  const [member, setMember] = useState(initialMember);
  const [photo, setPhoto] = useState(initialMember?.photo || "");

  // Form states
  const [formState, setFormState] = useState({
    fullName: initialMember?.fullName || "",
    phone: initialMember?.phone || "",
    birthDate: initialMember?.birthDate ? new Date(initialMember.birthDate).toISOString().split("T")[0] : "",
    gender: initialMember?.gender || "OTHER",
    address: initialMember?.address || "",
    emergencyContact: initialMember?.emergencyContact || "",
    emergencyPhone: initialMember?.emergencyPhone || "",
  });

  const { fullName, phone, birthDate, gender, address, emergencyContact, emergencyPhone } = formState;
  const setFullName = (v: string) => setFormState((p) => ({ ...p, fullName: v }));
  const setPhone = (v: string) => setFormState((p) => ({ ...p, phone: v }));
  const setBirthDate = (v: string) => setFormState((p) => ({ ...p, birthDate: v }));
  const setGender = (v: string) => setFormState((p) => ({ ...p, gender: v }));
  const setAddress = (v: string) => setFormState((p) => ({ ...p, address: v }));
  const setEmergencyContact = (v: string) => setFormState((p) => ({ ...p, emergencyContact: v }));
  const setEmergencyPhone = (v: string) => setFormState((p) => ({ ...p, emergencyPhone: v }));

  const handleCancel = () => {
    // Reset values to original
    setFormState({
      fullName: member?.fullName || "",
      phone: member?.phone || "",
      birthDate: member?.birthDate ? new Date(member.birthDate).toISOString().split("T")[0] : "",
      gender: member?.gender || "OTHER",
      address: member?.address || "",
      emergencyContact: member?.emergencyContact || "",
      emergencyPhone: member?.emergencyPhone || "",
    });
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("El nombre completo es requerido");
      return;
    }
    if (!phone.trim()) {
      toast.error("El teléfono es requerido");
      return;
    }

    setLoading(true);
    try {
      const res = await updatePortalMemberProfileAction({
        fullName,
        phone,
        birthDate: birthDate || null,
        gender,
        address: address || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
      });

      if (res.success) {
        toast.success(res.message);
        setMember(res.data);
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(res.error || "Error al actualizar perfil");
      }
    } catch (error) {
      toast.error("Error de conexión al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
        const res = await updatePortalMemberProfileAction({ photo: data.url });
        if (res.success) {
          toast.success("Foto de perfil actualizada");
          setPhoto(data.url);
          setMember(res.data);
          router.refresh();
        } else {
          toast.error(res.error || "Error al guardar la foto en el perfil");
        }
      } else {
        toast.error(data.error || "No se pudo subir la foto");
      }
    } catch (error) {
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhotoConfirm = async () => {
    setDeletePhotoLoading(true);
    try {
      const res = await updatePortalMemberProfileAction({ photo: null });
      if (res.success) {
        toast.success("Foto de perfil eliminada correctamente");
        setPhoto("");
        setMember(res.data);
        setIsDeletePhotoOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Error al eliminar la foto");
      }
    } catch (error) {
      toast.error("Error de conexión al eliminar la foto");
    } finally {
      setDeletePhotoLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-fast">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-serif leading-tight">Mi Perfil</h1>
          <p className="text-muted-foreground font-sans">Gestiona tu información personal, de contacto y cuenta.</p>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-center h-11 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary-foreground font-sans rounded-xl font-medium tracking-wide flex items-center gap-2 transition-colors px-5"
          >
            <Edit2 className="w-4 h-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Avatar Card */}
        <PortalProfileAvatarCard
          member={member}
          user={initialUser}
          photo={photo}
          fullName={fullName}
          uploading={uploading}
          onTriggerUpload={handleTriggerUpload}
          onDeletePhotoClick={() => setIsDeletePhotoOpen(true)}
          fileInputRef={fileInputRef}
          onPhotoUpload={handlePhotoUpload}
        />

        {/* Right Side: Form details */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="glass-card p-8 border-white/5 space-y-8">
            {/* Personal Information */}
            <PersonalInfoFormSection
              isEditing={isEditing}
              member={member}
              fullName={fullName}
              setFullName={setFullName}
              phone={phone}
              setPhone={setPhone}
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              gender={gender}
              setGender={setGender}
              address={address}
              setAddress={setAddress}
            />

            {/* Emergency Information */}
            <EmergencyContactFormSection
              isEditing={isEditing}
              member={member}
              emergencyContact={emergencyContact}
              setEmergencyContact={setEmergencyContact}
              emergencyPhone={emergencyPhone}
              setEmergencyPhone={setEmergencyPhone}
            />

            {/* Action Buttons for Editing */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5 animate-in slide-in-from-bottom-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={loading}
                  className="h-11 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 font-sans px-5"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-sans rounded-xl font-medium tracking-wide shadow-lg shadow-primary/20 px-5 flex items-center"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Guardar Cambios
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Confirm Photo Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeletePhotoOpen}
        onOpenChange={setIsDeletePhotoOpen}
        onConfirm={handleDeletePhotoConfirm}
        title="¿Eliminar foto de perfil?"
        description="Esta acción eliminará tu foto actual. Podrás subir una nueva foto en cualquier momento."
        confirmText="Eliminar Foto"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deletePhotoLoading}
      />
    </div>
  );
}
