"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, Move, Check, X, Crown, Activity } from "lucide-react";
import Avatar from "boring-avatars";
import { cn } from "@/lib/utils";

interface MemberPhotoSectionProps {
  member: any;
  photo: string;
  photoPosition: number;
  photoControlsVisible: boolean;
  isUploading: boolean;
  tier: "vip" | "standard" | "basic" | "none";
  displayPosition: number;
  dragReposition: any;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPhotoControlsToggle: (visible: boolean) => void;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

export function MemberPhotoSection({
  member,
  photo,
  photoPosition,
  photoControlsVisible,
  isUploading,
  tier,
  displayPosition,
  dragReposition,
  fileInputRef,
  onPhotoControlsToggle,
  onUpload,
  onDelete
}: MemberPhotoSectionProps) {
  return (
    <div 
      className="relative group shrink-0"
      onMouseEnter={() => photo && !dragReposition.isRepositioning && onPhotoControlsToggle(true)}
      onMouseLeave={() => !dragReposition.isRepositioning && onPhotoControlsToggle(false)}
    >
      {/* Tier ring effects */}
      {tier === "vip" && (
        <div className="absolute -inset-1.5 rounded-full bg-linear-to-r from-amber-400 via-yellow-300 to-amber-500 animate-spin-slow opacity-80 blur-[1px] z-0" />
      )}
      {tier === "standard" && (
        <div className="absolute -inset-1 rounded-full bg-linear-to-br from-emerald-400/50 via-primary/40 to-teal-500/50 z-0" />
      )}
      {tier === "basic" && (
        <div className="absolute -inset-0.5 rounded-full z-0" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(148,163,184,0.3) 20deg, transparent 40deg, rgba(148,163,184,0.3) 60deg, transparent 80deg, rgba(148,163,184,0.3) 100deg, transparent 120deg, rgba(148,163,184,0.3) 140deg, transparent 160deg, rgba(148,163,184,0.3) 180deg, transparent 200deg, rgba(148,163,184,0.3) 220deg, transparent 240deg, rgba(148,163,184,0.3) 260deg, transparent 280deg, rgba(148,163,184,0.3) 300deg, transparent 320deg, rgba(148,163,184,0.3) 340deg, transparent 360deg)' }} />
      )}
      <div 
        role="button"
        tabIndex={0}
        className={cn(
          "size-40 rounded-full border shadow-2xl transition-colors duration-300 relative overflow-hidden bg-muted/30 z-10",
          dragReposition.isRepositioning
            ? "border-primary ring-2 ring-primary/20 scale-105" 
            : tier === "vip" 
              ? "border-amber-400/60 ring-2 ring-amber-400/20"
              : tier === "standard"
                ? "border-emerald-400/40 ring-1 ring-emerald-400/10"
                : tier === "basic"
                  ? "border-zinc-400/30"
                  : "border-border/10 hover:border-primary/20"
        )}
        onMouseDown={dragReposition.onMouseDown}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
          }
        }}
        onTouchStart={dragReposition.onTouchStart}
        onTouchMove={dragReposition.onTouchMove}
        onTouchEnd={dragReposition.onTouchEnd}
      >
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5 backdrop-blur-sm">
            <Activity className="size-8 text-primary animate-spin" />
          </div>
        ) : photo ? (
          <Image 
            src={photo} 
            alt={member.fullName}
            fill
            className="object-cover select-none pointer-events-none transition-transform duration-700 group-hover:scale-110"
            style={{ objectPosition: `50% ${displayPosition}%` }}
            sizes="(max-width: 768px) 160px, 160px"
          />
        ) : (
          <Avatar
            size={160}
            name={member.fullName}
            variant="beam"
            colors={["#22c55e", "#10b981", "#059669", "#064e3b", "#0f172a"]}
          />
        )}
        {dragReposition.isRepositioning && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
            <Move className="size-8 text-white animate-pulse drop-shadow-md" />
          </div>
        )}
      </div>

      {!dragReposition.isRepositioning && (
        <button type="button" aria-label="Upload photo" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px] rounded-full z-20">
          <Camera className="size-8 text-white/90 drop-shadow-lg" />
        </button>
      )}


      {/* VIP Crown Badge */}
      {tier === "vip" && !dragReposition.isRepositioning && (
        <div className="absolute -top-1 -right-1 z-30 bg-linear-to-br from-amber-400 to-yellow-500 rounded-full p-1.5 shadow-lg shadow-amber-500/30 border-2 border-background animate-zoom-in">
          <Crown className="size-3.5 text-amber-900" />
        </div>
      )}

      {(dragReposition.isRepositioning || (photo && photoControlsVisible)) && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/95 backdrop-blur-xl border border-border/20 rounded-full p-1 shadow-2xl z-20 animate-zoom-in">
          {dragReposition.isRepositioning ? (
            <>
              <button type="button" aria-label="Confirm reposition" onClick={dragReposition.confirmReposition} className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"><Check className="size-4" /></button>
              <div className="w-px h-3 bg-border/50 mx-1" />
              <button type="button" aria-label="Cancel reposition" onClick={dragReposition.cancelReposition} className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors"><X className="size-4" /></button>
            </>
          ) : (
            <>
              <button type="button" aria-label="Upload photo" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"><Camera className="size-4" /></button>
              <button type="button" aria-label="Reposition photo" onClick={dragReposition.enterReposition} className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"><Move className="size-4" /></button>
              <button type="button" aria-label="Delete photo" onClick={onDelete} className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors"><Trash2 className="size-4" /></button>
            </>
          )}
        </div>
      )}
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
    </div>
  );
}
