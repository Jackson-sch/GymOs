import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-8 bg-transparent">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900/40 p-8 backdrop-blur-xl shadow-2xl">
        <div className="relative flex items-center justify-center h-16 w-16">
          <div className="absolute h-full w-full rounded-full border-4 border-emerald-500/20" />
          <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
        </div>
        <div className="text-center">
          <p className="font-serif text-lg font-bold text-zinc-100 tracking-wide">Cargando GymOS...</p>
          <p className="text-xs text-zinc-400">Preparando tu experiencia deportiva</p>
        </div>
      </div>
    </div>
  );
}
