"use client";
 
import React from "react";
import { 
  Check,
  ChevronsUpDown,
  Activity, 
  History, 
  Search, 
  QrCode,
  User,
  ArrowRight,
  UserCheck,
  Users,
  Cake,
  Zap
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { registerAttendanceAction } from "@/lib/actions/attendance-actions";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { QRScanner } from "@/components/shared/QRScanner";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";


export function AttendanceClient({ 
  history, 
  members, 
  occupancy,
  stats
}: { 
  history: any[], 
  members: any[], 
  occupancy: number,
  stats: any
}) {
  const [isCheckInOpen, setIsCheckInOpen] = React.useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState("");
  const [open, setOpen] = React.useState(false);

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

  // Pre-sort history to ensure newest is at the top
  const sortedHistory = React.useMemo(() => {
    return [...history].sort((a, b) => {
      const dateA = new Date(a.checkIn).getTime();
      const dateB = new Date(b.checkIn).getTime();
      return dateB - dateA;
    });
  }, [history]);

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
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-white/5 border-white/10 h-12 text-left font-normal hover:bg-white/10"
                      >
                        {selectedMember
                          ? members.find((m) => m.id === selectedMember)?.fullName
                          : "Seleccionar socio..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 glass-card bg-black/95 border-white/10" align="start">
                      <Command className="bg-transparent text-white">
                        <CommandInput placeholder="Buscar por nombre o DNI..." className="h-12 border-none focus:ring-0" />
                        <CommandList className="max-h-[300px] custom-scrollbar">
                          <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">No se encontraron socios.</CommandEmpty>
                          <CommandGroup>
                            {members.map((m) => (
                              <CommandItem
                                key={m.id}
                                value={`${m.fullName} ${m.dni}`}
                                onSelect={() => {
                                  setSelectedMember(m.id);
                                  setOpen(false);
                                }}
                                className="flex items-center justify-between py-3 px-4 aria-selected:bg-white/10 cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{m.fullName}</span>
                                  <span className="text-[10px] text-muted-foreground">{m.dni}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4 text-primary",
                                    selectedMember === m.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
          <div className="glass-card p-8 border-white/5 bg-linear-to-br from-emerald-500/5 to-transparent">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Ocupación Actual</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-6xl font-serif leading-none">{occupancy}</span>
              <span className="text-muted-foreground font-sans text-sm uppercase tracking-widest">Socios en sala</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" 
                style={{ width: `${Math.min((occupancy / 100) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Estadísticas de Hoy */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Users className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total Hoy</p>
                <p className="text-2xl font-serif">{stats.totalToday}</p>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                <Cake className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Cumpleaños</p>
                <p className="text-2xl font-serif">{stats.birthdaysToday}</p>
              </div>
            </div>
          </div>

          {/* Distribución por Plan */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Distribución</h3>
            </div>
            
            <div className="space-y-4">
              {stats.planDistribution.length > 0 ? (
                stats.planDistribution.map((plan: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-medium">
                      <span className="text-muted-foreground">{plan.name}</span>
                      <span>{plan.value}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500/50 rounded-full" 
                        style={{ width: `${Math.min((plan.value / occupancy) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground uppercase italic text-center py-4">Esperando socios...</p>
              )}
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

          <div className="space-y-1.5 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedHistory.map((entry: any) => (
              <div key={entry.id} className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/3 transition-all border border-transparent hover:border-white/5 cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-emerald-500">
                    <UserCheck className="w-4.5 h-4.5 text-emerald-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">{entry.member.fullName}</p>
                      <Badge variant="outline" className="text-[7px] h-3.5 px-1 uppercase tracking-tighter bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        {entry.member.memberships?.[0]?.plan?.name || "ACTIVO"}
                      </Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">
                      {entry.method} • HACE {formatDistanceToNow(new Date(entry.checkIn), { locale: es, addSuffix: false })}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
