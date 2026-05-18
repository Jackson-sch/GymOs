"use client";

import { useMemo, useState, useEffect, useReducer } from "react";
import {
  Check,
  ChevronsUpDown,
  History,
  QrCode,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { QRScanner } from "@/components/shared/QRScanner";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LiveStatusMonitor } from "./components/LiveStatusMonitor";
import AttendanceFeed from "./components/AttendanceFeed";

const initialState = {
  isCheckInOpen: false,
  isQRScannerOpen: false,
  loading: false,
  selectedMember: "",
  open: false,
};

function attendanceReducer(state: any, action: any) {
  switch (action.type) {
    case "SET_CHECKIN_OPEN":
      return { ...state, isCheckInOpen: action.payload };
    case "SET_QR_OPEN":
      return { ...state, isQRScannerOpen: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_SELECTED_MEMBER":
      return { ...state, selectedMember: action.payload };
    case "SET_OPEN":
      return { ...state, open: action.payload };
    case "RESET_FORMS":
      return {
        ...state,
        isCheckInOpen: false,
        isQRScannerOpen: false,
        selectedMember: "",
      };
    default:
      return state;
  }
}

export function AttendanceClient({
  history,
  members,
  occupancy,
  stats,
}: {
  history: any[];
  members: any[];
  occupancy: number;
  stats: any;
}) {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);
  const { isCheckInOpen, isQRScannerOpen, loading, selectedMember, open } =
    state;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckIn = async (
    memberId: string,
    method: "QR" | "MANUAL" = "MANUAL",
  ) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const result = await registerAttendanceAction(memberId, method);
    if (result.success) {
      toast.success("Check-in exitoso");
      dispatch({ type: "RESET_FORMS" });
    } else {
      toast.error(result.error);
    }
    dispatch({ type: "SET_LOADING", payload: false });
  };

  // Pre-sort history to ensure newest is at the top
  const sortedHistory = useMemo(() => {
    return history.toSorted((a: any, b: any) => {
      const dateA = new Date(a.checkIn).getTime();
      const dateB = new Date(b.checkIn).getTime();
      return dateB - dateA;
    });
  }, [history]);

  return (
    <div className="space-y-12">
      {/* Header Actions */}
      <div className="flex justify-end gap-4">
        <Dialog
          open={isQRScannerOpen}
          onOpenChange={(val) =>
            dispatch({ type: "SET_QR_OPEN", payload: val })
          }
        >
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2">
              <QrCode className="size-5" />
              Escanear QR
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">
                Escáner de Acceso
              </DialogTitle>
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

        <Dialog
          open={isCheckInOpen}
          onOpenChange={(val) =>
            dispatch({ type: "SET_CHECKIN_OPEN", payload: val })
          }
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-6 h-12 font-sans font-semibold tracking-wide gap-2"
            >
              <UserCheck className="size-5" />
              Check-in Manual
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-black/95 backdrop-blur-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">
                Registrar Acceso
              </DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Selecciona al socio para validar su entrada.
              </DialogDescription>
            </DialogHeader>
            {isCheckInOpen && (
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Socio
                  </Label>
                  <Popover
                    open={open}
                    onOpenChange={(val) =>
                      dispatch({ type: "SET_OPEN", payload: val })
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls="member-selection-list"
                        className="w-full justify-between bg-white/5 border-white/10 h-12 text-left font-normal hover:bg-white/10"
                      >
                        {selectedMember
                          ? members.find((m) => m.id === selectedMember)
                              ?.fullName
                          : "Seleccionar socio..."}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-full p-0 glass-card bg-black/95 border-white/10"
                      align="start"
                    >
                      <Command
                        id="member-selection-list"
                        className="bg-transparent text-white"
                      >
                        <CommandInput
                          placeholder="Buscar por nombre o DNI..."
                          className="h-12 border-none focus:ring-0"
                        />
                        <CommandList className="max-h-[300px] custom-scrollbar">
                          <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
                            No se encontraron socios.
                          </CommandEmpty>
                          <CommandGroup>
                            {members.map((m) => (
                              <CommandItem
                                key={m.id}
                                value={`${m.fullName} ${m.dni}`}
                                onSelect={() => {
                                  dispatch({
                                    type: "SET_SELECTED_MEMBER",
                                    payload: m.id,
                                  });
                                  dispatch({
                                    type: "SET_OPEN",
                                    payload: false,
                                  });
                                }}
                                className="flex items-center justify-between py-3 px-4 aria-selected:bg-white/10 cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {m.fullName}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {m.dni}
                                  </span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto size-4 text-primary",
                                    selectedMember === m.id
                                      ? "opacity-100"
                                      : "opacity-0",
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
        <LiveStatusMonitor occupancy={occupancy} stats={stats} />

        {/* Attendance Feed */}
        <div className="lg:col-span-8 glass-card p-8 border-white/5 relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <History className="size-5 text-primary" />
              <h2 className="text-2xl font-serif">Feed de Actividad</h2>
            </div>
          </div>

          <AttendanceFeed history={sortedHistory} mounted={mounted} />
        </div>
      </div>
    </div>
  );
}
