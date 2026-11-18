"use client";

import React, { useState } from "react";
import { Calendar, CreditCard, Plus, QrCode, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClassForm } from "@/components/shared/forms/ClassForm";
import { MemberForm } from "@/components/shared/forms/MemberForm";
import { PaymentForm } from "@/components/shared/forms/PaymentForm";
import { QRScanner } from "@/components/shared/QRScanner";
import { registerAttendanceAction } from "@/lib/actions/attendance-actions";
import { getMembersAction } from "@/lib/actions/members-actions";
import { getPlansAction } from "@/lib/actions/plans-actions";
import { getTrainersAction } from "@/lib/actions/trainers-actions";
import { toast } from "sonner";

interface QuickActionsBarProps {
  selectedBranchId: string;
  selectedBranchName: string;
}

export function QuickActionsBar({
  selectedBranchId,
  selectedBranchName,
}: QuickActionsBarProps) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isClassOpen, setIsClassOpen] = useState(false);

  const [modalData, setModalData] = useState<{
    members: any[];
    plans: any[];
    trainers: any[];
  }>({
    members: [],
    plans: [],
    trainers: [],
  });

  const loadModalData = async () => {
    if (modalData.members.length > 0 && modalData.plans.length > 0) return;
    const [mRes, pRes, tRes] = await Promise.all([
      getMembersAction({ branchId: selectedBranchId }),
      getPlansAction(),
      getTrainersAction(),
    ]);
    setModalData({
      members: mRes.success ? (mRes.data as any[]) : [],
      plans: pRes.success ? (pRes.data as any[]) : [],
      trainers: tRes.success ? (tRes.data as any[]) : [],
    });
  };

  const handleQrScan = async (memberId: string) => {
    const result = await registerAttendanceAction(memberId, "QR");
    if (result.success) {
      toast.success("Check-in con QR registrado correctamente");
      setIsQrOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="glass-card p-4 rounded-3xl border-white/10 bg-zinc-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-md">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2 flex items-center gap-2">
        <Zap className="size-4 text-primary shrink-0" /> Accesos Directos Rápidos (Modales en Vivo):
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-9 rounded-xl bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform"
            >
              <QrCode className="size-3.5 mr-1.5" /> Marcación QR
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">
                Escáner de Acceso QR
              </DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Apunta la cámara al código QR del socio para registrar su entrada en{" "}
                {selectedBranchName}.
              </DialogDescription>
            </DialogHeader>
            <div className="pt-4">
              {isQrOpen && <QRScanner onScan={handleQrScan} />}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isMemberOpen} onOpenChange={setIsMemberOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-9 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform"
            >
              <Plus className="size-3.5 mr-1.5" /> Nuevo Socio
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">
                Registrar Nuevo Socio
              </DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Ingresa los datos personales y de membresía para dar de alta al socio.
              </DialogDescription>
            </DialogHeader>
            {isMemberOpen && (
              <MemberForm
                onSuccess={() => {
                  setIsMemberOpen(false);
                  toast.success("Socio creado exitosamente");
                  window.location.reload();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={isPaymentOpen}
          onOpenChange={(open) => {
            setIsPaymentOpen(open);
            if (open) loadModalData();
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <CreditCard className="size-3.5 mr-1.5 text-primary" /> Registrar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl max-w-xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">
                Registrar Pago en Caja
              </DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Vincula un socio a un plan y registra el ingreso financiero.
              </DialogDescription>
            </DialogHeader>
            {isPaymentOpen && (
              <PaymentForm
                members={modalData.members}
                plans={modalData.plans}
                trainers={modalData.trainers}
                onSuccess={() => {
                  setIsPaymentOpen(false);
                  toast.success("Pago registrado con éxito");
                  window.location.reload();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={isClassOpen}
          onOpenChange={(open) => {
            setIsClassOpen(open);
            if (open) loadModalData();
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              <Calendar className="size-3.5 mr-1.5 text-primary" /> Programar Clase
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground">
                Programar Clase Grupal
              </DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                Define el horario, capacidad y entrenador a cargo de la sesión.
              </DialogDescription>
            </DialogHeader>
            {isClassOpen && (
              <ClassForm
                trainers={modalData.trainers}
                onSuccess={() => {
                  setIsClassOpen(false);
                  toast.success("Clase programada exitosamente");
                  window.location.reload();
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
