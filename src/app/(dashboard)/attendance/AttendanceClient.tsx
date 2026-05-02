"use client";

import React from "react";
import { 
  Activity, 
  History, 
  Search, 
  QrCode,
  User,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { registerAttendanceAction } from "@/lib/actions/attendance-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { QRScanner } from "@/components/shared/QRScanner";

export function AttendanceClient({ history, members }: { history: any[], members: any[] }) {
  const [isCheckInOpen, setIsCheckInOpen] = React.useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState("");

  const handleCheckIn = async (memberId: string, method: "QR" | "MANUAL" = "MANUAL") => {
    setLoading(true);
    const result = await registerAttendanceAction(memberId, method);
    if (result.success) {
      toast.success("Check-in exitoso");
      setIsCheckInOpen(false);
      setIsQRScannerOpen(false);
      setSelectedMember("");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-12">
      {/* Header Actions */}
      <div className="flex justify-end gap-4">
        <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2">
              <QrCode className="w-5 h-5" />
              Escanear QR
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">Escáner de Acceso</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Apunta la cámara al código QR del socio para validar su entrada.
              </DialogDescription>
            </DialogHeader>
            <div className="pt-4">
              {isQRScannerOpen && (
                <QRScanner onScan={(id) => handleCheckIn(id, "QR")} />
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-6 h-12 font-sans font-semibold tracking-wide gap-2">
              <UserCheck className="w-5 h-5" />
              Check-in Manual
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">Registrar Acceso</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Selecciona al socio para validar su entrada.
              </DialogDescription>
            </DialogHeader>
            {isCheckInOpen && (
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Socio</Label>
                  <Select onValueChange={setSelectedMember}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12">
                      <SelectValue placeholder="Buscar por nombre o DNI..." />
                    </SelectTrigger>
                    <SelectContent className="glass-card bg-black/90 text-white max-h-60">
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.fullName} ({m.dni})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => handleCheckIn(selectedMember, "MANUAL")} 
                  disabled={loading || !selectedMember}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl font-bold uppercase tracking-widest"
                >
                  {loading ? "Validando..." : "Confirmar Entrada"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Status Monitor */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Ocupación Actual</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-6xl font-serif leading-none">42</span>
              <span className="text-muted-foreground font-sans text-sm uppercase tracking-widest">Socios en sala</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[42%] h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
        </div>

        {/* Attendance Feed */}
        <div className="lg:col-span-8 glass-card p-8 border-white/5 relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-serif">Feed de Actividad</h2>
            </div>
          </div>

          <div className="space-y-4">
            {history.map((entry: any) => (
              <div key={entry.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    <User className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{entry.member.fullName}</p>
                      <Badge variant="outline" className="text-[8px] h-4 uppercase tracking-tighter bg-primary/10 text-primary border-primary/20">
                        {entry.member.memberships?.[0]?.plan?.name || "Activo"}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                      {entry.method} • {format(new Date(entry.checkIn), "hh:mm a", { locale: es })}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: any) {
  return <label className={className}>{children}</label>;
}
