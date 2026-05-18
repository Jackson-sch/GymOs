"use client";

import React from "react";
import Image from "next/image";
import { Camera, Trash2, Move, Check, X, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import Avatar from "boring-avatars";

interface PhotoManagerProps {
  formData: any;
  isUploading: boolean;
  photoControlsVisible: boolean;
  dragReposition: any;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  dispatch: React.Dispatch<any>;
  fullName: string;
  deletePhoto: () => void;
  uploadPhoto: (file: File) => void;
}

export function PhotoManager({ 
  formData, 
  isUploading, 
  photoControlsVisible, 
  dragReposition, 
  fileInputRef, 
  dispatch, 
  fullName, 
  deletePhoto, 
  uploadPhoto 
}: PhotoManagerProps) {
  const hasPhoto = !!formData.photo;
  const displayPosition = dragReposition.isRepositioning ? dragReposition.position : (formData.photoPosition ?? 50);

  const handleMouseEnter = () => {
    if (!dragReposition.isRepositioning && (formData.photo)) {
      dispatch({ type: "SET_PHOTO_CONTROLS", payload: true });
    }
  };

  const handleMouseLeave = () => {
    if (!dragReposition.isRepositioning) {
      dispatch({ type: "SET_PHOTO_CONTROLS", payload: false });
    }
  };

  return (
    <div 
      className="relative group shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={dragReposition.containerRef}
        role="region"
        aria-label="Foto de perfil del entrenador"
        className={cn(
          "size-40 rounded-full border shadow-2xl transition-all duration-300 relative overflow-hidden bg-muted/30",
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
            <Activity className="size-8 text-primary animate-spin" />
          </div>
        ) : hasPhoto ? (
          <Image 
            src={formData.photo} 
            alt={fullName}
            fill
            className="object-cover select-none pointer-events-none transition-transform duration-700 group-hover:scale-110"
            draggable={false}
            style={{ objectPosition: `50% ${displayPosition}%` }}
            sizes="(max-width: 768px) 160px, 160px"
          />
        ) : (
          <Avatar
            size={160}
            name={fullName}
            variant="beam"
            colors={["#22c55e", "#10b981", "#059669", "#064e3b", "#0f172a"]}
          />
        )}
        
        {!dragReposition.isRepositioning && (
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer z-10"
            aria-label="Cambiar foto de perfil"
          >
            <Camera className="size-8 text-white/90 drop-shadow-lg" />
          </button>
        )}

        {dragReposition.isRepositioning && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
            <Move className="size-8 text-white animate-pulse drop-shadow-md" />
          </div>
        )}
      </div>

      {(dragReposition.isRepositioning || (hasPhoto && photoControlsVisible)) && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/95 backdrop-blur-xl border border-border/20 rounded-full p-1 shadow-2xl z-20 animate-in fade-in zoom-in duration-300">
          {dragReposition.isRepositioning ? (
            <>
              <button
                onClick={dragReposition.confirmReposition}
                className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
                title="Guardar"
              >
                <Check className="size-4" />
              </button>
              <div className="w-px h-3 bg-border/50 mx-1" />
              <button
                onClick={dragReposition.cancelReposition}
                className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors"
                title="Cancelar"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
                title="Cambiar foto"
              >
                <Camera className="size-4" />
              </button>
              <button
                onClick={dragReposition.enterReposition}
                className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
                title="Ajustar posición"
              >
                <Move className="size-4" />
              </button>
              <button
                onClick={deletePhoto}
                className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors"
                title="Eliminar"
              >
                <Trash2 className="size-4" />
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
  );
}
