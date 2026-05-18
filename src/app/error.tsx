"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <div className="relative mx-auto flex max-w-md flex-col items-center rounded-2xl border border-white/10 bg-zinc-900/50 p-8 text-center backdrop-blur-xl shadow-2xl">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20 shadow-lg shadow-red-500/10">
          <AlertTriangle className="h-8 w-8 animate-pulse" />
        </div>
        <h2 className="mb-2 font-serif text-2xl font-bold tracking-tight text-white">
          Ha ocurrido un error inesperado
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-zinc-400">
          Hemos detectado un problema al cargar esta vista en GymOS. Nuestro equipo ha sido notificado del incidente.
        </p>
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Intentar de nuevo</span>
        </button>
      </div>
    </div>
  );
}
