"use client";

import React, { useMemo, useState, useEffect, useReducer } from "react";
import {
  Check,
  ChevronsUpDown,
  History,
  QrCode,
  UserCheck,
  Search,
  Filter,
  Activity,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { useQueryState, parseAsInteger } from "nuqs";

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
  const { isCheckInOpen, isQRScannerOpen, loading, selectedMember, open } = state;
  const [mounted] = useState(() => typeof window !== "undefined");
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  const handleCheckIn = async (
    memberId: string,
    method: "QR" | "MANUAL" = "MANUAL",
  ) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const result = await registerAttendanceAction(memberId, method);
    if (result.success) {
      toast.success("Check-in exitoso");
      dispatch({ type: "RESET_FORMS" });
      window.location.reload();
    } else {
      toast.error(result.error);
    }
    dispatch({ type: "SET_LOADING", payload: false });
  };

  // Pagination state
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(12));

  // Filtered dataset
  const filteredHistory = useMemo(() => {
    return history.filter((entry: any) => {
      const query = search.trim().toLowerCase();
      const memberName = entry.member?.fullName?.toLowerCase() || "";
      const planName = entry.member?.memberships?.[0]?.plan?.name?.toLowerCase() || "";
      const methodStr = (entry.method || "").toLowerCase();

      const matchesSearch =
        !query || memberName.includes(query) || planName.includes(query) || methodStr.includes(query);

      const matchesMethod =
        methodFilter === "ALL" || (entry.method || "").toUpperCase() === methodFilter.toUpperCase();

      let matchesDate = true;
      if (entry.checkIn) {
        const checkInDate = new Date(entry.checkIn);
        if (dateFrom) {
          const fromD = new Date(`${dateFrom}T00:00:00`);
          if (checkInDate < fromD) matchesDate = false;
        }
        if (dateTo) {
          const toD = new Date(`${dateTo}T23:59:59`);
          if (checkInDate > toD) matchesDate = false;
        }
      }

      return matchesSearch && matchesMethod && matchesDate;
    }).toSorted((a: any, b: any) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
  }, [history, search, methodFilter, dateFrom, dateTo]);

  // Paginated dataset
  const totalPages = Math.ceil(filteredHistory.length / (pageSize || 12));
  const paginatedHistory = useMemo(() => {
    const p = page || 1;
    const s = pageSize || 12;
    return filteredHistory.slice((p - 1) * s, p * s);
  }, [filteredHistory, page, pageSize]);

  return (
    <div className="space-y-8 w-full">
      {/* Action Bar & Control Panel */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 glass-card p-4 rounded-3xl border-white/10">
        {/* SINGLE UNIFIED SEARCH INPUT & DATE RANGE */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por socio o plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl text-xs focus-visible:ring-primary/30 transition-colors"
            />
          </div>

          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onSelectRange={({ from, to }) => {
              setDateFrom(from);
              setDateTo(to);
            }}
            placeholder="Filtrar por fechas"
            showPresets={false}
            align="start"
          />

          {/* Method Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 shrink-0">
            {[
              { id: "ALL", label: "Todos" },
              { id: "QR", label: "Acceso QR" },
              { id: "MANUAL", label: "Check-in Manual" },
            ].map((m) => (
              <button type="button"
                key={m.id}
                onClick={() => setMethodFilter(m.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
                  methodFilter === m.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dialog Triggers */}
        <div className="flex items-center gap-3 justify-end shrink-0">
          <Dialog
            open={isQRScannerOpen}
            onOpenChange={(val) => dispatch({ type: "SET_QR_OPEN", payload: val })}
          >
            <DialogTrigger asChild>
              <Button className="h-11 rounded-2xl bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-transform">
                <QrCode className="size-4 mr-2" /> Escanear QR
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground">Escáner de Acceso QR</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Apunta la cámara al código QR del socio para validar su entrada.
                </DialogDescription>
              </DialogHeader>
              <div className="pt-4">
                {isQRScannerOpen && <QRScanner onScan={(id) => handleCheckIn(id, "QR")} />}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCheckInOpen}
            onOpenChange={(val) => dispatch({ type: "SET_CHECKIN_OPEN", payload: val })}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <UserCheck className="size-4 mr-2 text-primary" /> Check-in Manual
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif text-foreground">Marcación Manual</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                  Selecciona el socio para confirmar su ingreso a sala.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Socio a Registrar
                  </Label>
                  <Popover
                    open={open}
                    onOpenChange={(val) => dispatch({ type: "SET_OPEN", payload: val })}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-12 bg-white/5 border-white/10 rounded-2xl text-xs font-semibold"
                      >
                        {selectedMember
                          ? members.find((m) => m.id === selectedMember)?.fullName
                          : "Buscar socio por nombre..."}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl rounded-2xl">
                      <Command>
                        <CommandInput placeholder="Buscar socio..." className="h-10 text-xs" />
                        <CommandList>
                          <CommandEmpty className="text-xs py-4 text-center text-muted-foreground">
                            No se encontraron socios.
                          </CommandEmpty>
                          <CommandGroup>
                            {members.map((member) => (
                              <CommandItem
                                key={member.id}
                                value={member.fullName}
                                onSelect={() => {
                                  dispatch({ type: "SET_SELECTED_MEMBER", payload: member.id });
                                  dispatch({ type: "SET_OPEN", payload: false });
                                }}
                                className="text-xs font-semibold"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 size-4 text-primary",
                                    selectedMember === member.id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {member.fullName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  onClick={() => selectedMember && handleCheckIn(selectedMember, "MANUAL")}
                  disabled={!selectedMember || loading}
                  className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
                >
                  {loading ? "Procesando..." : "Confirmar Check-in"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Grid: Live Feed + Status Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 glass-card p-6 md:p-8 border-white/15 rounded-3xl backdrop-blur-md space-y-6 bg-zinc-950/85 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Registro de Marcaciones en Vivo</h2>
              <p className="text-xs text-muted-foreground">Historial en tiempo real de entradas al gimnasio</p>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs font-bold px-3 py-1">
              {filteredHistory.length} Marcaciones
            </Badge>
          </div>

          <AttendanceFeed history={paginatedHistory} mounted={mounted} />

          {/* Numeric Pagination Bar */}
          <PaginationBar
            currentPage={page || 1}
            totalPages={totalPages}
            pageSize={pageSize || 12}
            totalItems={filteredHistory.length}
            onPageChange={(p: number) => setPage(p)}
            onPageSizeChange={(s: number) => setPageSize(s)}
            pageSizeOptions={[8, 12, 24, 48]}
            itemLabel="marcaciones"
          />
        </div>

        <LiveStatusMonitor occupancy={occupancy} stats={stats} />
      </div>
    </div>
  );
}
