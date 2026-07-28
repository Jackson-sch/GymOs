"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Clock,
  User,
  CheckCircle2,
  Lock,
  Dumbbell
} from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";

interface MemberPortalInfo {
  id: string;
  fullName: string;
  dni?: string | null;
  email?: string | null;
  photo?: string | null;
  qrCode: string;
  status: string;
  organizationName?: string;
  planName?: string;
  endDate?: string | Date;
}

export function DynamicQRClient({ member }: { member: MemberPortalInfo }) {
  const [timeLeft, setTimeLeft] = useState(30);
  const tokenSuffixRef = React.useRef<string | null>(null);
  if (tokenSuffixRef.current === null) {
    tokenSuffixRef.current = Date.now().toString().slice(-6);
  }
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Regenerate token and update QR data URL
  useEffect(() => {
    const updateQR = () => {
      const suffix = Date.now().toString().slice(-6);
      tokenSuffixRef.current = suffix;
      const payload = `GYMOS:${member.id}:${member.qrCode}:${suffix}`;
      QRCode.toDataURL(payload, {
        width: 300,
        margin: 2,
        color: {
          dark: "#ffffff",
          light: "#00000000"
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error al generar QR:", err));
    };

    updateQR();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [member.id, member.qrCode]);

  useEffect(() => {
    if (timeLeft === 0) {
      const suffix = Date.now().toString().slice(-6);
      tokenSuffixRef.current = suffix;
      const payload = `GYMOS:${member.id}:${member.qrCode}:${suffix}`;
      QRCode.toDataURL(payload, {
        width: 300,
        margin: 2,
        color: {
          dark: "#ffffff",
          light: "#00000000"
        }
      })
        .then((url) => {
          setQrDataUrl(url);
          setTimeLeft(30);
        })
        .catch((err) => console.error("Error al generar QR:", err));
    }
  }, [timeLeft, member.id, member.qrCode]);

  const progressPct = (timeLeft / 30) * 100;

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in pb-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-widest">
          <ShieldCheck className="size-3.5" />
          Credencial Digital Segura
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Pase de Ingreso QR
        </h1>
        <p className="text-xs text-muted-foreground">
          Presenta este código en el escaner de la recepción para registrar tu acceso.
        </p>
      </div>

      <div className="glass-card p-8 border-white/10 space-y-6 relative overflow-hidden text-center shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-left">
            <div className="size-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Dumbbell className="size-4 text-primary" />
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-foreground">
                {member.organizationName || "GymOS"}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                Socio Activo
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="size-3" />
            Válido
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 py-2">
          <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative shadow-lg">
            {member.photo ? (
              <Image src={member.photo} alt={member.fullName} fill className="object-cover" sizes="64px" />
            ) : (
              <User className="size-8 text-muted-foreground/40" />
            )}
          </div>
          <div className="text-left space-y-1">
            <h3 className="text-lg font-serif font-bold text-foreground">
              {member.fullName}
            </h3>
            {member.dni && (
              <p className="text-xs font-mono text-muted-foreground">
                DNI: {member.dni}
              </p>
            )}
            {member.planName && (
              <p className="text-xs font-semibold text-primary">
                Plan: {member.planName}
              </p>
            )}
          </div>
        </div>

        <div className="relative p-6 rounded-3xl bg-zinc-900/90 border border-white/10 flex flex-col items-center justify-center space-y-4 shadow-inner">
          <div className="relative size-56 p-3 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center shadow-xl group">
            {qrDataUrl ? (
              /* eslint-disable-next-html-element-suppression */
              <img
                src={qrDataUrl}
                alt="QR de Ingreso"
                className="size-48 object-contain rounded-xl"
              />
            ) : (
              <div className="size-48 bg-white/5 rounded-xl animate-pulse flex items-center justify-center text-xs text-muted-foreground">
                Generando QR...
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 pointer-events-none animate-pulse" />
          </div>

          <div className="w-full space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-sans px-1">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <Lock className="size-3 text-emerald-400" />
                Token dinámico anti-capturas
              </span>
              <span className="font-mono text-xs font-bold text-primary flex items-center gap-1">
                <Clock className="size-3" />
                {timeLeft}s
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-primary transition-colors duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/80 font-sans">
          🔒 El código QR se regenera cada 30 segundos automáticamente por seguridad.
        </p>
      </div>
    </div>
  );
}
