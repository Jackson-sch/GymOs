"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ChevronRight,
  Clock,
  CreditCard,
  Settings,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const getActionIcon = (type: string) => {
  switch (type) {
    case "ATTENDANCE":
      return UserCheck;
    case "MEMBER_CREATE":
      return UserPlus;
    case "PAYMENT":
      return CreditCard;
    case "SYSTEM_UPDATE":
      return Settings;
    default:
      return ShieldCheck;
  }
};

interface RecentActivityCardProps {
  activityData: any[];
}

export function RecentActivityCard({ activityData }: RecentActivityCardProps) {
  return (
    <div className="xl:col-span-5 glass-card p-5 sm:p-6 md:p-8 border-white/15 rounded-3xl bg-zinc-950/85 backdrop-blur-md shadow-2xl space-y-4 flex flex-col justify-between min-w-0">
      <div className="space-y-4 min-w-0">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
              <Clock className="size-4 shrink-0" />
              <span>Bitácora en Tiempo Real</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-foreground">
              Actividad Reciente
            </h2>
          </div>
        </div>

        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {activityData.length > 0 ? (
            activityData.map((item: any) => {
              const Icon = getActionIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 group p-2.5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div
                    className={cn(
                      "size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors font-bold",
                      item.status === "emerald"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                        : item.status === "primary"
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-foreground truncate capitalize">
                      {item.action.toLowerCase()}:{" "}
                      <span className="text-muted-foreground font-normal">
                        {item.user}
                      </span>
                    </p>
                    <p
                      className="text-[10px] text-muted-foreground font-mono uppercase"
                      suppressHydrationWarning
                    >
                      Hace{" "}
                      {formatDistanceToNow(new Date(item.date), {
                        locale: es,
                        addSuffix: false,
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Activity className="size-8 text-primary/40 mb-2" />
              <p className="text-xs font-bold uppercase">Sin actividad reciente</p>
            </div>
          )}
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        className="w-full h-auto min-h-11 py-2.5 px-4 whitespace-normal text-center leading-tight rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold text-[11px] sm:text-xs uppercase tracking-wider text-primary mt-2"
      >
        <Link
          href="/audit-log"
          className="inline-flex items-center justify-center gap-1.5"
        >
          <span>Ver Historial de Auditoría Completo</span>
          <ChevronRight className="size-4 shrink-0" />
        </Link>
      </Button>
    </div>
  );
}
