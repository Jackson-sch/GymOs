"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Receipt, Calendar, CheckCircle2, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export function MemberPaymentsTab({ member }: { member: any }) {
  // Collect all payments from member memberships
  const payments: any[] = [];

  if (member.memberships) {
    member.memberships.forEach((m: any) => {
      if (m.payments && Array.isArray(m.payments)) {
        m.payments.forEach((p: any) => {
          payments.push({
            ...p,
            planName: m.plan?.name || "Membresía",
          });
        });
      }
    });
  }

  // Sort by createdAt desc
  payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (payments.length === 0) {
    return (
      <Card className="glass-card border-white/10 p-12 text-center">
        <Receipt className="size-12 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h3 className="text-xl font-serif font-bold text-foreground">Sin Historial de Pagos</h3>
        <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
          Este socio no registra transacciones de pagos o suscripciones activas en el sistema.
        </p>
        <Button asChild className="mt-6 rounded-2xl bg-primary font-bold text-xs uppercase tracking-wider px-6">
          <Link href="/payments">Registrar Pago en Caja</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-fast">
      <div className="glass-card border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-foreground">Historial de Cobros & Recibos</h3>
            <p className="text-xs text-muted-foreground">Registro de transacciones financieras del alumno</p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-bold font-mono px-3 py-1">
            {payments.length} Transacciones
          </Badge>
        </div>

        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-bold text-xs py-4">Fecha</TableHead>
              <TableHead className="text-muted-foreground font-bold text-xs py-4">Concepto / Plan</TableHead>
              <TableHead className="text-muted-foreground font-bold text-xs py-4">Método</TableHead>
              <TableHead className="text-muted-foreground font-bold text-xs py-4">Monto</TableHead>
              <TableHead className="text-muted-foreground font-bold text-xs py-4 text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p: any) => (
              <TableRow key={p.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="py-4 font-mono text-xs text-muted-foreground">
                  {format(new Date(p.createdAt), "dd MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell className="py-4">
                  <p className="text-sm font-semibold text-foreground">{p.planName}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">ID: {p.id.substring(0, 8)}</p>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold bg-white/5 border-white/10 text-foreground">
                    {p.paymentMethod || "EFECTIVO"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 font-serif font-bold text-base text-foreground">
                  S/ {Number(p.amount || 0).toFixed(2)}
                </TableCell>
                <TableCell className="py-4 text-right">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold uppercase gap-1 px-3 py-1">
                    <CheckCircle2 className="size-3" /> PAGADO
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
