import { Crown, Star, Medal } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function TopMembersRanking({ topMembers }: { topMembers: any[] }) {
  return (
    <div className="glass-card overflow-hidden h-full flex flex-col">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
        <div>
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Crown className="size-3" />
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Ranking de Lealtad</p>
          </div>
          <h3 className="text-2xl font-serif">Miembros Elite</h3>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={`dot-col-${i}`} className="flex flex-col gap-1.5">
              {[0, 1, 2].map((j) => (
                <div key={`dot-${i}-${j}`} className="size-1 rounded-full bg-primary/20" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/5 flex-1">
        {topMembers.slice(0, 8).map((member: any, i: number) => (
          <div key={member.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-all duration-300 group cursor-default">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative shadow-2xl">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.fullName}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-125"
                      sizes="48px"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-zinc-800 to-zinc-950 w-full h-full flex items-center justify-center">
                      <span className="text-sm font-serif text-muted-foreground/60">{member.fullName?.[0]}</span>
                    </div>
                  )}
                </div>
                <div className={`absolute -top-1.5 -right-1.5 size-6 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold shadow-xl ${
                  i === 0 ? "bg-amber-500 text-zinc-950" : 
                  i === 1 ? "bg-slate-300 text-zinc-950" : 
                  i === 2 ? "bg-orange-600 text-white" : 
                  "bg-zinc-900 text-primary"
                }`}>
                  {i + 1}
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="font-serif text-lg leading-tight group-hover:text-primary transition-colors">{member.fullName}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">DNI {member.dni || "S/D"}</p>
                  {i < 3 && <Star className="size-2 text-amber-500 fill-amber-500" />}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-serif leading-none text-primary/80 group-hover:text-primary group-hover:scale-110 transition-all">{member.visitCount}</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Visitas</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-white/2 border-t border-white/5">
        <Button variant="ghost" className="w-full text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors">
          Ver ranking completo
        </Button>
      </div>
    </div>
  );
}

