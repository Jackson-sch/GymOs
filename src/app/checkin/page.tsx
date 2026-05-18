"use client";

import React from "react";
import { QRScanner } from "@/components/shared/QRScanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, User, LogIn, LogOut, Camera, Search, KeyRound } from "lucide-react";
import { getCheckInStats } from "@/lib/actions/checkin-actions";

export default function CheckInPage({ initialStats }: { initialStats?: any }) {
  const [isQRScannerOpen, setIsQRScannerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pinInput, setPinInput] = React.useState("");
  const [isScanning, setIsScanning] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [stats, setStats] = React.useState(initialStats || { checkedIn: 0, totalActive: 0, occupancyRate: 0 });

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const refreshStats = async () => {
      try {
        const res = await fetch("/api/checkin/stats");
        const data = await res.json();
        if (data.checkedIn !== undefined) {
          setStats((prev: any) => ({
            ...prev,
            checkedIn: data.checkedIn,
            totalActive: data.totalActive,
            occupancyRate: data.occupancyRate ?? prev.occupancyRate,
          }));
        }
      } catch (e) {}
    };
    
    interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = async (qrCode: string) => {
    setIsScanning(true);
    setResult(null);
    
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode, method: "QR" }),
      });
      const data = await res.json();
      setResult(data);
      
      if (data.success) {
        setTimeout(() => setResult(null), 5000);
      }
    } catch (err) {
      setResult({ success: false, error: "Error al procesar QR" });
    } finally {
      setIsScanning(false);
    }
  };

  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim() || pinInput.length < 4) return;
    
    setIsScanning(true);
    setResult(null);
    
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput.trim(), method: "PIN" }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setPinInput("");
        setTimeout(() => setResult(null), 5000);
      }
    } catch (err) {
      setResult({ success: false, error: "Error al verificar PIN" });
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsScanning(true);
    setResult(null);
    
    try {
      const res = await fetch(`/api/checkin/manual?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: "Error al buscar" });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-16">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border border-primary/30 mb-4 shadow-lg shadow-primary/20">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif tracking-tight">Recepción & Control</h1>
          <p className="text-white/60 text-xs tracking-wider uppercase mt-1">Verificación de Identidad Digital</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
            <CardContent className="p-4 text-center space-y-1">
              <div className="text-3xl font-mono font-bold text-primary">{stats.checkedIn}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Asistencias Hoy</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
            <CardContent className="p-4 text-center space-y-1">
              <div className="text-3xl font-mono font-bold">{stats.totalActive}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Socios Activos</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
            <CardContent className="p-4 text-center space-y-1">
              <div className="text-3xl font-mono font-bold text-emerald-400">{stats.occupancyRate}%</div>
              <div className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Aforo Actual</div>
            </CardContent>
          </Card>
        </div>

        {result && (
          <Card className={`bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${result.success ? "border-emerald-500/50 bg-emerald-500/5" : "border-rose-500/50 bg-rose-500/5"}`}>
            <CardContent className="p-6 text-center">
              {result.success ? (
                <>
                  <div className={`text-4xl mb-3 ${result.type === "checkin" ? "text-emerald-500 animate-bounce" : "text-amber-500"}`}>
                    {result.type === "checkin" ? <LogIn className="w-12 h-12 mx-auto" /> : <LogOut className="w-12 h-12 mx-auto" />}
                  </div>
                  <h3 className="text-2xl font-serif mb-1 text-foreground">{result.message}</h3>
                  {result.member && (
                    <div className="flex items-center justify-center gap-3 mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 max-w-xs mx-auto">
                      {result.member.photo ? (
                        <img src={result.member.photo} alt="" className="w-12 h-12 rounded-full object-cover border border-primary/50 shadow-md" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="text-left">
                        <span className="font-bold text-sm block">{result.member.fullName}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Acceso Autorizado</span>
                      </div>
                    </div>
                  )}
                  {result.daysLeft !== undefined && result.daysLeft !== null && (
                    <p className="text-xs font-bold uppercase tracking-widest text-white/60 mt-4">
                      {result.daysLeft} días restantes de vigencia
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <div className="text-rose-500 text-4xl mb-2 font-bold animate-in shake">✕</div>
                  <h3 className="text-xl font-serif text-rose-500">Acceso Denegado</h3>
                  <p className="text-white/80 text-sm">{result.error}</p>
                  {result.member && (
                    <p className="text-xs font-bold text-white/60 mt-2">{result.member.fullName}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <Button 
            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all duration-300" 
            onClick={() => setIsQRScannerOpen(true)}
            disabled={isScanning}
          >
            <Camera className="mr-3 h-5 w-5" />
            Escanear Código QR
          </Button>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden group">
          <CardHeader className="bg-white/2 pb-4 border-b border-white/5">
            <CardTitle className="text-xs uppercase tracking-widest font-bold flex items-center gap-2 text-primary">
              <KeyRound className="w-4 h-4" />
              Ingreso por PIN de Kiosco
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <form onSubmit={handlePinSubmit} className="flex gap-2">
              <Input
                type="password"
                maxLength={6}
                placeholder="Ingresar PIN (4-6 dígitos)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="bg-white/10 border-white/20 h-12 rounded-xl text-center font-mono tracking-[0.5em] text-lg placeholder:tracking-normal placeholder:text-xs"
              />
              <Button type="submit" disabled={isScanning || pinInput.length < 4} className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                Validar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-white/2 pb-4 border-b border-white/5">
            <CardTitle className="text-xs uppercase tracking-widest font-bold flex items-center gap-2 text-muted-foreground">
              <Search className="w-4 h-4 text-primary" />
              Búsqueda Manual
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por Nombre o DNI"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                className="bg-white/10 border-white/20 h-12 rounded-xl placeholder:text-xs"
              />
              <Button onClick={handleManualSearch} disabled={isScanning} variant="outline" className="h-12 px-6 rounded-xl border-white/10 glass-card font-bold uppercase tracking-widest text-[10px]">
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {isQRScannerOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 p-6 animate-in fade-in duration-300">
            <div className="flex flex-col h-full max-w-md mx-auto justify-center space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif text-white">Escanear QR</h2>
                  <p className="text-xs text-white/60 uppercase tracking-widest">Ubica el código frente a la cámara</p>
                </div>
                <Button variant="outline" onClick={() => setIsQRScannerOpen(false)} className="rounded-xl border-white/10 glass-card font-bold text-xs">
                  Cerrar
                </Button>
              </div>
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                <QRScanner onScan={handleScan} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}