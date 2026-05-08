"use client";

import React from "react";
import { QRScanner } from "@/components/shared/QRScanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, User, LogIn, LogOut, Camera, Search } from "lucide-react";
import { getCheckInStats } from "@/lib/actions/checkin-actions";

export default function CheckInPage({ initialStats }: { initialStats?: any }) {
  const [isQRScannerOpen, setIsQRScannerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isScanning, setIsScanning] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [stats] = React.useState(initialStats || { checkedIn: 0, totalActive: 0 });

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const refreshStats = async () => {
      try {
        const res = await fetch("/api/checkin/stats");
        const data = await res.json();
        if (data.checkedIn !== undefined) {
          stats.checkedIn = data.checkedIn;
          stats.totalActive = data.totalActive;
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
      const res = await fetch("/api/checkin/process", {
        method: "POST",
        body: JSON.stringify({ qrCode, method: "QR" }),
      });
      const data = await res.json();
      setResult(data);
      
      if (data.success) {
        setTimeout(() => setResult(null), 5000);
      }
    } catch (err) {
      setResult({ success: false, error: "Error al procesar" });
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
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Check-in</h1>
          <p className="text-white/60">Escanea tu código QR</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.checkedIn}</div>
              <div className="text-xs text-white/60">Check-in hoy</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.totalActive}</div>
              <div className="text-xs text-white/60">Miembros activos</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
              <div className="text-xs text-white/60">Ocupación</div>
            </CardContent>
          </Card>
        </div>

        {result && (
          <Card className={`bg-white/5 border-white/10 ${result.success ? "border-green-500/50" : "border-red-500/50"}`}>
            <CardContent className="p-6 text-center">
              {result.success ? (
                <>
                  <div className={`text-4xl mb-2 ${result.type === "checkin" ? "text-green-500" : "text-amber-500"}`}>
                    {result.type === "checkin" ? <LogIn className="w-12 h-12 mx-auto" /> : <LogOut className="w-12 h-12 mx-auto" />}
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{result.message}</h3>
                  {result.member && (
                    <div className="flex items-center justify-center gap-3 mt-4">
                      {result.member.photo ? (
                        <img src={result.member.photo} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <span className="font-medium">{result.member.fullName}</span>
                    </div>
                  )}
                  {result.daysLeft !== undefined && result.daysLeft !== null && (
                    <p className="text-sm text-white/60 mt-2">
                      {result.daysLeft} días restantes de membresía
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-red-500 text-4xl mb-2">✕</div>
                  <h3 className="text-xl font-semibold text-red-500">Error</h3>
                  <p className="text-white/60">{result.error}</p>
                  {result.member && (
                    <p className="text-sm mt-2">{result.member.fullName}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Button 
            className="w-full h-16 text-lg" 
            onClick={() => setIsQRScannerOpen(true)}
            disabled={isScanning}
          >
            <Camera className="mr-2 h-5 w-5" />
            Escanear QR
          </Button>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="w-4 h-4" />
              Búsqueda manual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Nombre o DNI"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                className="bg-white/10 border-white/20"
              />
              <Button onClick={handleManualSearch} disabled={isScanning}>
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {isQRScannerOpen && (
          <div className="fixed inset-0 bg-black/95 z-50 p-4">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Escanear código QR</h2>
                <Button variant="outline" onClick={() => setIsQRScannerOpen(false)}>
                  Cerrar
                </Button>
              </div>
              <div className="flex-1 relative">
                <QRScanner onScan={handleScan} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}