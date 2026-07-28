"use client";

import React from "react";
import { Crown, Trophy, Medal, Award, Star } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const getRankBadge = (index: number) => {
  switch (index) {
    case 0:
      return {
        icon: Crown,
        bg: "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/10",
        label: "1° Oro",
      };
    case 1:
      return {
        icon: Trophy,
        bg: "bg-slate-300/20 text-slate-200 border-slate-300/40 shadow-slate-300/10",
        label: "2° Plata",
      };
    case 2:
      return {
        icon: Medal,
        bg: "bg-amber-700/20 text-amber-500 border-amber-700/40 shadow-amber-700/10",
        label: "3° Bronce",
      };
    default:
      return {
        icon: Award,
        bg: "bg-white/5 text-muted-foreground border-white/10",
        label: `${index + 1}° Top`,
      };
  }
};

export function TopMembersRanking({ topMembers }: { topMembers: any[] }) {
  const members = topMembers.slice(0, 5);
  const maxVisits = Math.max(...members.map((m) => m.visitCount || m.attendancesCount || 1), 1);

  return (
    <div className="glass-card overflow-hidden h-full flex flex-col border-white/10 rounded-3xl backdrop-blur-md">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400">
            <Crown className="size-4" />
            <p className="text-[10px] uppercase tracking-widest font-bold">
              Ranking de Lealtad (Top 5)
            </p>
          </div>
          <h3 className="text-2xl font-serif text-foreground">Miembros Elite</h3>
        </div>
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1"
        >
          Constancia
        </Badge>
      </div>

      <div className="divide-y divide-white/5 flex-1">
        {members.map((member: any, i: number) => {
          const rank = getRankBadge(i);
          const RankIcon = rank.icon;
          const visitCount = member.visitCount || member.attendancesCount || 0;
          const progressPercent = Math.round((visitCount / maxVisits) * 100);

          return (
            <div
              key={member.id || member.dni || member.fullName}
              className="p-5 hover:bg-white/5 transition-colors duration-300 group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Rank Metallic Icon */}
                <div
                  className={`size-9 rounded-xl border flex items-center justify-center shrink-0 shadow-md ${rank.bg}`}
                >
                  <RankIcon className="size-4" />
                </div>

                {/* Avatar */}
                <div className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative shrink-0 shadow-inner">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.fullName}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="44px"
                    />
                  ) : (
                    <div className="bg-linear-to-br from-zinc-800 to-zinc-950 size-full flex items-center justify-center">
                      <span className="text-xs font-serif font-bold text-muted-foreground">
                        {member.fullName?.[0] || "M"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name & Progress Bar */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-serif text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {member.fullName}
                    </p>
                    {i === 0 && (
                      <Star className="size-3 text-amber-400 fill-amber-400 shrink-0" />
                    )}
                  </div>

                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded-full transition-colors duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Visit Count Badge */}
              <div className="text-right shrink-0">
                <p className="text-2xl font-serif font-bold text-primary leading-none">
                  {visitCount}
                </p>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mt-0.5">
                  Visitas
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white/2 border-t border-white/5 text-center">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
          Calculado en base al historial de accesos por torniquete
        </p>
      </div>
    </div>
  );
}
