"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, Loader2, ShieldCheck, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalProfileAvatarCardProps {
  member: any;
  user: any;
  photo: string;
  fullName: string;
  uploading: boolean;
  onTriggerUpload: () => void;
  onDeletePhotoClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PortalProfileAvatarCard({
  member,
  user,
  photo,
  fullName,
  uploading,
  onTriggerUpload,
  onDeletePhotoClick,
  fileInputRef,
  onPhotoUpload,
}: PortalProfileAvatarCardProps) {
  const currentMembership = member?.memberships?.[0];
  const planName = currentMembership?.plan?.name || "";
  const isVip = /vip|premium/i.test(planName);
  const isStandard = /est[aá]ndar/i.test(planName);
  const isBasic = /b[aá]sico/i.test(planName);

  return (
    <div className="lg:col-span-1 glass-card p-8 border-white/5 flex flex-col items-center text-center space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      
      <div className="relative">
        {/* Tier ring effects */}
        {isVip && (
          <div className="absolute -inset-1.5 rounded-full animate-spin-slow opacity-80 blur-[1px] z-0" />
        )}
        {isStandard && (
          <div className="absolute -inset-1 rounded-full bg-linear-to-br from-emerald-400/50 via-primary/40 to-teal-500/50 z-0" />
        )}
        {isBasic && (
          <div className="absolute -inset-0.5 rounded-full z-0" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(148,163,184,0.3) 20deg, transparent 40deg, rgba(148,163,184,0.3) 60deg, transparent 80deg, rgba(148,163,184,0.3) 100deg, transparent 120deg, rgba(148,163,184,0.3) 140deg, transparent 160deg, rgba(148,163,184,0.3) 180deg, transparent 200deg, rgba(148,163,184,0.3) 220deg, transparent 240deg, rgba(148,163,184,0.3) 260deg, transparent 280deg, rgba(148,163,184,0.3) 300deg, transparent 320deg, rgba(148,163,184,0.3) 340deg, transparent 360deg)' }} />
        )}

        <Avatar className={cn(
          "w-36 h-36 border shadow-xl p-1 relative z-10 transition-colors transition-transform group-hover:scale-105 duration-300",
          isVip 
            ? "border-amber-400/60 ring-2 ring-amber-400/20"
            : isStandard
              ? "border-emerald-400/40 ring-1 ring-emerald-400/10"
              : isBasic
                ? "border-zinc-400/30"
                : "border-white/10"
        )}>
          <AvatarImage src={photo || ""} className="rounded-full object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary text-5xl font-serif">
            {fullName?.substring(0, 2).toUpperCase() || "JA"}
          </AvatarFallback>
        </Avatar>

        {/* VIP Crown Badge */}
        {isVip && (
          <div className="absolute -top-1 -right-1 z-30 bg-linear-to-br from-amber-400 to-yellow-500 rounded-full p-1.5 shadow-lg shadow-amber-500/30 border-2 border-background animate-zoom-in">
            <Crown className="w-3.5 h-3.5 text-amber-900" />
          </div>
        )}

        <button type="button"
          onClick={onTriggerUpload}
          disabled={uploading}
          className="absolute bottom-1 right-1 z-20 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-lg border border-white/20 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
          title="Cambiar Foto"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onPhotoUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-serif tracking-tight text-foreground">{fullName}</h2>
        <p className="text-sm text-muted-foreground font-sans">{user?.email}</p>
      </div>

      {photo && (
        <Button
          variant="ghost"
          type="button"
          onClick={onDeletePhotoClick}
          className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl px-4 py-2 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar Foto
        </Button>
      )}

      <div className="pt-6 border-t border-white/5 w-full space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground font-sans">Rol del Sistema</span>
          <span className="font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-mono tracking-wider">
            Socio
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground font-sans">Estado de Portal</span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1 font-sans">
            <ShieldCheck className="w-3.5 h-3.5" />
            Habilitado
          </span>
        </div>
      </div>
    </div>
  );
}
