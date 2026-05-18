import React from "react";
import { Loader2, Dumbbell } from "lucide-react";

export default function PortalLoading() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-8">
      <div className="glass-card p-12 rounded-3xl flex flex-col items-center text-center space-y-6 max-w-md w-full border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
        
        <div className="bg-primary/20 p-5 rounded-3xl backdrop-blur-md border border-white/10 animate-bounce">
          <Dumbbell className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-3 w-full flex flex-col items-center">
          <div className="h-8 w-48 bg-white/10 rounded-xl animate-pulse border border-white/5" />
          <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse" />
        </div>

        <div className="flex items-center space-x-3 text-muted-foreground pt-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-xs uppercase font-mono tracking-widest font-semibold">
            Cargando Identidad & Perfil...
          </span>
        </div>
      </div>
    </div>
  );
}
