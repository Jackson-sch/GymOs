"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  Info,
  Download,
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { regeneratePortalQRAction } from "@/lib/actions/portal-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface QRClientProps {
  member: any;
  planName: string;
  isActive: boolean;
}

export function QRClient({ member, planName, isActive }: QRClientProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const generateQR = async () => {
    try {
      const url = await QRCode.toDataURL(member.qrCode, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    generateQR();
  }, [member.qrCode]);

  const handleRegenerate = async () => {
    if (!confirm("¿Estás seguro de que deseas regenerar tu código? El código anterior dejará de funcionar inmediatamente.")) return;
    
    setIsLoading(true);
    const res = await regeneratePortalQRAction();
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif">Tarjeta Digital</h1>
        <p className="text-muted-foreground text-sm">Presenta este código en recepción para ingresar al local.</p>
      </div>

      {/* The "Access Card" */}
      <div className={cn(
        "relative aspect-[2/3] w-full rounded-[2.5rem] p-1 overflow-hidden transition-all duration-500",
        isActive ? "bg-gradient-to-br from-primary/40 via-primary/5 to-primary/40 shadow-[0_0_50px_rgba(var(--primary),0.15)]" : "bg-gradient-to-br from-destructive/40 via-destructive/5 to-destructive/40 shadow-[0_0_50px_rgba(239,68,68,0.15)]"
      )}>
        {/* Animated Hologram Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
        
        <div className="w-full h-full bg-background/80 backdrop-blur-2xl rounded-[2.3rem] flex flex-col p-8 border border-white/10 relative z-10">
          {/* Card Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">GymOS Member</span>
              <h2 className="text-2xl font-serif truncate max-w-[200px]">{member.fullName}</h2>
            </div>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-destructive/10 border-destructive/20 text-destructive"
            )}>
              {isActive ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="relative group p-4 bg-white rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-105">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="QR Code" 
                  className={cn(
                    "w-64 h-64 transition-opacity duration-300",
                    !isActive && "opacity-20 grayscale"
                  )} 
                />
              ) : (
                <div className="w-64 h-64 bg-muted animate-pulse rounded-2xl" />
              )}
              
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest rotate-[-15deg] shadow-lg">
                    Plan Vencido
                  </div>
                </div>
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Estado del Plan</p>
              <p className={cn(
                "text-lg font-sans font-light",
                isActive ? "text-emerald-500" : "text-destructive"
              )}>
                {planName}
              </p>
            </div>
          </div>

          {/* Card Footer */}
          <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
            <div className="flex gap-4">
               <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Download className="w-5 h-5" />
               </button>
               <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="w-5 h-5" />
               </button>
            </div>
            <div className="text-right">
              <p className="text-[8px] uppercase tracking-widest text-muted-foreground">ID de Seguridad</p>
              <p className="text-[10px] font-mono text-muted-foreground/60">{member.qrCode.substring(0, 8)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 group"
          onClick={handleRegenerate}
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2 text-primary transition-transform duration-500", isLoading && "animate-spin")} />
          Regenerar Código de Seguridad
        </Button>

        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-primary shrink-0" />
          <p className="text-[10px] text-primary/80 leading-relaxed">
            Tu código QR es personal e intransferible. Si sospechas que alguien más lo está usando, utiliza el botón de regenerar para invalidar el código actual y obtener uno nuevo.
          </p>
        </div>
      </div>
    </div>
  );
}
