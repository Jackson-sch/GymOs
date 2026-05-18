"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowRight, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function AttendanceFeed({
  history,
  mounted,
}: {
  history: any[];
  mounted: boolean;
}) {
  return (
    <div className="space-y-1.5 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
      {history.map((entry: any) => (
        <div
          key={entry.id}
          className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/3 transition-all border border-transparent hover:border-white/5 cursor-default"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-emerald-500">
              <UserCheck className="size-4.5 text-emerald-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium">{entry.member.fullName}</p>
                <Badge
                  variant="outline"
                  className="text-[7px] h-3.5 px-1 uppercase tracking-tighter bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                >
                  {entry.member.memberships?.[0]?.plan?.name || "ACTIVO"}
                </Badge>
              </div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">
                {entry.method} • HACE{" "}
                {mounted
                  ? formatDistanceToNow(new Date(entry.checkIn), {
                      locale: es,
                      addSuffix: false,
                    })
                  : "..."}
              </p>
            </div>
          </div>
          <ArrowRight className="size-3.5 text-muted-foreground/20 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
        </div>
      ))}
    </div>
  );
}
