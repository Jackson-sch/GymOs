"use client";

import React, { useState, useEffect, useRef } from "react";
import { processKioskCheckInAction } from "@/lib/actions/attendance-actions";
import { CheckCircle2, XCircle, ScanLine, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Avatar from "boring-avatars";
import { QRScanner } from "@/components/shared/QRScanner";

export function KioskClient() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "GRANTED" | "DENIED" | "NOT_FOUND">("IDLE");
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on input for barcode scanners
  useEffect(() => {
    const keepFocus = () => {
      if (status === "IDLE" && inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    keepFocus();
    const interval = setInterval(keepFocus, 2000);
    return () => clearInterval(interval);
  }, [status]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim() || status === "LOADING") return;

    setStatus("LOADING");
    
    const res = await processKioskCheckInAction(code.trim());
    
    if (res.success && res.status === "GRANTED") {
      setStatus("GRANTED");
      setMemberInfo(res.member);
      // Play success sound
      playAudio("/sounds/success.mp3");
    } else if (res.success && res.status === "DENIED") {
      setStatus("DENIED");
      setMemberInfo(res.member);
      setReason(res.reason || "");
      // Play error sound
      playAudio("/sounds/error.mp3");
    } else {
      setStatus("NOT_FOUND");
      setReason("Código o DNI no reconocido");
      playAudio("/sounds/error.mp3");
    }

    // Reset after 4 seconds
    setTimeout(() => {
      setStatus("IDLE");
      setCode("");
      setMemberInfo(null);
      setReason("");
      setIsScanning(false);
    }, 4000);
  };

  const handleScan = (decodedText: string) => {
    setIsScanning(false);
    setCode(decodedText);
    // We need to pass the code directly because state update is async
    submitCheckIn(decodedText);
  };

  const submitCheckIn = async (scanCode: string) => {
    setStatus("LOADING");
    const res = await processKioskCheckInAction(scanCode.trim());
    
    if (res.success && res.status === "GRANTED") {
      setStatus("GRANTED");
      setMemberInfo(res.member);
      playAudio("/sounds/success.mp3");
    } else if (res.success && res.status === "DENIED") {
      setStatus("DENIED");
      setMemberInfo(res.member);
      setReason(res.reason || "");
      playAudio("/sounds/error.mp3");
    } else {
      setStatus("NOT_FOUND");
      setReason("Código o DNI no reconocido");
      playAudio("/sounds/error.mp3");
    }

    setTimeout(() => {
      setStatus("IDLE");
      setCode("");
      setMemberInfo(null);
      setReason("");
      setIsScanning(false);
    }, 4000);
  };

  const playAudio = (path: string) => {
    try {
      const audio = new Audio(path);
      audio.play().catch(e => console.log("Audio play prevented:", e));
    } catch (e) {
      // ignore
    }
  };

  const handleKeypad = (num: string) => {
    setCode(prev => prev + num);
  };

  const handleBackspace = () => {
    setCode(prev => prev.slice(0, -1));
  };

  return (
    <div className={cn(
      "w-full h-screen flex flex-col items-center justify-center transition-colors duration-500",
      status === "GRANTED" ? "bg-emerald-950/40" : 
      status === "DENIED" || status === "NOT_FOUND" ? "bg-destructive/20" : 
      "bg-background"
    )}>
      
      {/* Hidden input for physical scanners */}
      <form onSubmit={handleSubmit} className="opacity-0 absolute top-0 left-0">
        <input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          className="opacity-0 w-1 h-1"
        />
      </form>

      <div className="max-w-2xl w-full p-8 flex flex-col items-center justify-center animate-in zoom-in duration-500">
        
        {status === "IDLE" && (
          <div className="text-center space-y-12 w-full max-w-sm">
            <div className="space-y-4">
              <div className="relative group">
                {isScanning ? (
                  <div className="w-full max-w-[300px] mx-auto overflow-hidden rounded-3xl border-2 border-primary shadow-[0_0_50px_rgba(var(--primary),0.2)] animate-in zoom-in duration-300">
                    <QRScanner onScan={handleScan} />
                    <button 
                      onClick={() => setIsScanning(false)}
                      className="w-full py-4 bg-destructive/10 text-destructive text-[10px] uppercase tracking-[0.2em] font-bold border-t border-destructive/20 hover:bg-destructive/20 transition-colors"
                    >
                      Cancelar Escaneo
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsScanning(true)}
                    className="w-28 h-28 bg-primary/20 rounded-full flex items-center justify-center mx-auto relative group interactive-hover"
                  >
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                    <ScanLine className="w-12 h-12 text-primary relative z-10" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl font-serif tracking-tight">Bienvenido</h1>
                <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-bold">
                  Escanea tu código QR o ingresa tu DNI
                </p>
              </div>
            </div>

            {/* Visual display of entered code */}
            <div className="h-16 flex items-center justify-center text-4xl font-mono tracking-[0.3em] font-bold text-primary border-b-2 border-primary/30 mx-8">
              {code || <span className="opacity-30">------</span>}
            </div>

            {/* Keypad for manual entry (Touch friendly) */}
            <div className="grid grid-cols-3 gap-4 mx-auto mt-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleKeypad(num.toString())}
                  className="h-16 text-2xl font-bold bg-white/5 hover:bg-white/10 rounded-2xl transition-colors active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleBackspace}
                className="h-16 text-xl font-bold bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-2xl transition-colors active:scale-95"
              >
                DEL
              </button>
              <button
                onClick={() => handleKeypad("0")}
                className="h-16 text-2xl font-bold bg-white/5 hover:bg-white/10 rounded-2xl transition-colors active:scale-95"
              >
                0
              </button>
              <button
                onClick={() => handleSubmit()}
                className="h-16 text-xl font-bold bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 transition-colors active:scale-95"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {status === "LOADING" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <h2 className="text-2xl font-serif text-muted-foreground">Validando...</h2>
          </div>
        )}

        {status === "GRANTED" && memberInfo && (
          <div className="text-center space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_100px_rgba(16,185,129,0.3)] border border-emerald-500/30">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
            <div className="space-y-6 flex flex-col items-center">
              <div className="w-48 h-48 rounded-full border-4 border-emerald-500/50 shadow-2xl overflow-hidden bg-muted/30">
                {memberInfo.photo ? (
                  <img src={memberInfo.photo} className="w-full h-full object-cover" alt="Socio" />
                ) : (
                  <Avatar size={192} name={memberInfo.fullName} variant="beam" />
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl font-serif text-emerald-50 drop-shadow-md">
                  ¡Hola, {memberInfo.fullName.split(' ')[0]}!
                </h1>
                <p className="text-emerald-400/80 font-bold uppercase tracking-widest">
                  Plan {memberInfo.planName}
                </p>
                <div className="inline-block mt-4 px-6 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-lg font-bold">
                  ACCESO PERMITIDO
                </div>
              </div>
            </div>
          </div>
        )}

        {(status === "DENIED" || status === "NOT_FOUND") && (
          <div className="text-center space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="w-32 h-32 bg-destructive/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_100px_rgba(239,68,68,0.3)] border border-destructive/30">
              <XCircle className="w-16 h-16 text-destructive" />
            </div>
            <div className="space-y-6 flex flex-col items-center">
              {memberInfo && (
                <div className="w-40 h-40 rounded-full border-4 border-destructive/50 overflow-hidden bg-muted/30 opacity-70 grayscale">
                  {memberInfo.photo ? (
                    <img src={memberInfo.photo} className="w-full h-full object-cover" alt="Socio" />
                  ) : (
                    <Avatar size={160} name={memberInfo.fullName} variant="beam" />
                  )}
                </div>
              )}
              <div className="space-y-2">
                {memberInfo ? (
                  <h1 className="text-4xl font-serif text-destructive-foreground drop-shadow-md">
                    {memberInfo.fullName}
                  </h1>
                ) : (
                  <h1 className="text-4xl font-serif text-destructive drop-shadow-md">
                    No Encontrado
                  </h1>
                )}
                <div className="inline-block mt-4 px-6 py-2 bg-destructive/20 text-destructive rounded-full text-lg font-bold uppercase">
                  ACCESO DENEGADO
                </div>
                <p className="text-muted-foreground mt-4 text-xl">
                  {reason}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
