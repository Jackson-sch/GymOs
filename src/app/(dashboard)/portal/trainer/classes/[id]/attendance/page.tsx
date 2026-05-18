import React from "react";
import { getClassDetailWithBookingsAction } from "@/lib/actions/classes-actions";
import { TrainerClassAttendanceClient } from "./TrainerClassAttendanceClient";
import { verifySession } from "@/lib/security";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ClassAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  await verifySession(["TRAINER", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  
  const res = await getClassDetailWithBookingsAction(id);

  if (!res.success || !res.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-serif text-muted-foreground">{res.error || "Clase no encontrada"}</h2>
        <Link href="/portal/trainer">
          <Button variant="ghost">Volver al portal</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/portal/trainer">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif">{res.data.name}</h1>
          <p className="text-sm text-muted-foreground">Control de Asistencia</p>
        </div>
      </div>

      <TrainerClassAttendanceClient gymClass={res.data} />
    </div>
  );
}
