import React from "react";
import { MemberForm } from "@/components/forms/MemberForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewMemberPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/members">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Socio</h1>
          <p className="text-muted-foreground">
            Registra un nuevo miembro en el sistema.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <MemberForm />
      </div>
    </div>
  );
}
