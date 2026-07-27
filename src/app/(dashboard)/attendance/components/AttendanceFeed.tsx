"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, QrCode, ArrowRight, ExternalLink } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AttendanceFeed({
  history,
  mounted,
}: {
  history: any[];
  mounted: boolean;
}) {
  if (!history || history.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground space-y-2">
        <UserCheck className="size-10 text-primary/40 mx-auto" />
        <p className="text-sm font-bold text-foreground">Sin ingresos registrados</p>
        <p className="text-xs">Escanee un código QR o realice un check-in manual para iniciar marcaciones.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[680px] overflow-y-auto pr-2 custom-scrollbar">
      {history.map((entry: any) => {
        const isQr = (entry.method || "").toUpperCase() === "QR";
        const memberName = entry.member?.fullName || "Socio Registrado";
        const planName = entry.member?.memberships?.[0]?.plan?.name || "Membresía Activa";
        const initials = memberName.substring(0, 2).toUpperCase();

        return (
          <div
            key={entry.id}
            className="group flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-zinc-950/80 hover:border-primary/40 hover:bg-white/10 transition-all shadow-md backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="size-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                {isQr ? <QrCode className="size-5 text-emerald-400" /> : initials}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {memberName}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-2 py-0.5"
                  >
                    {planName}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1 font-bold text-primary">
                    {isQr ? (
                      <>
                        <QrCode className="size-3 text-emerald-400" />
                        <span>ACCESO QR</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="size-3 text-emerald-400" />
                        <span>CHECK-IN MANUAL</span>
                      </>
                    )}
                  </span>
                  <span>&bull;</span>
                  <span>
                    {mounted
                      ? formatDistanceToNow(new Date(entry.checkIn), {
                          locale: es,
                          addSuffix: true,
                        })
                      : "..."}
                  </span>
                  <span>&bull;</span>
                  <span className="text-foreground/80 font-semibold">
                    {mounted ? format(new Date(entry.checkIn), "HH:mm:ss") : "--:--"}
                  </span>
                </div>
              </div>
            </div>

            {entry.member?.id && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl opacity-80 group-hover:opacity-100 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-primary"
              >
                <Link href={`/members/${entry.member.id}`}>
                  Expediente <ArrowRight className="size-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
