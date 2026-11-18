import { formatDate } from "@/lib/formats";

export type MethodKey = "CASH" | "YAPE_PLIN" | "CARD" | "TRANSFER";
export type PeriodPreset = "MONTH" | "30D" | "TODAY" | "ALL";

export function normalizeMethodKey(rawMethod?: string): MethodKey {
  const m = (rawMethod || "").toUpperCase();
  if (m === "YAPE" || m === "PLIN" || m.includes("YAPE") || m.includes("PLIN") || m.includes("DIGITAL")) {
    return "YAPE_PLIN";
  }
  if (m === "CARD" || m.includes("CARD") || m.includes("TARJETA") || m.includes("POS")) {
    return "CARD";
  }
  if (m === "TRANSFER" || m.includes("TRANSFER") || m.includes("BANCO") || m.includes("BANK")) {
    return "TRANSFER";
  }
  return "CASH";
}

export function computeFinancialMetrics(payments: any[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  let todayTotal = 0;
  let todayCount = 0;
  let monthTotal = 0;
  let monthCount = 0;
  const methodTotals: Record<string, number> = {};

  payments.forEach((p) => {
    const amount = Number(p.amount || 0);
    const paidDate = new Date(p.createdAt);

    if (paidDate >= today) {
      todayTotal += amount;
      todayCount++;
    }
    if (paidDate >= firstDayOfMonth) {
      monthTotal += amount;
      monthCount++;
    }

    const m = (p.method || "EFECTIVO").toUpperCase();
    methodTotals[m] = (methodTotals[m] || 0) + amount;
  });

  const topMethodEntry = Object.entries(methodTotals).sort((a, b) => b[1] - a[1])[0];
  const topMethod = topMethodEntry ? topMethodEntry[0] : "EFECTIVO";
  const avgTicket = monthCount > 0 ? monthTotal / monthCount : 0;

  return { todayTotal, todayCount, monthTotal, monthCount, topMethod, avgTicket };
}

export function filterPayments(
  payments: any[],
  {
    search,
    selectedMethod,
    periodPreset,
    dateFrom,
    dateTo,
  }: {
    search: string;
    selectedMethod: string;
    periodPreset: PeriodPreset;
    dateFrom: string | null;
    dateTo: string | null;
  },
) {
  const query = search.trim().toLowerCase();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  return payments.filter((p) => {
    const matchesSearch =
      !query ||
      (p.member?.fullName?.toLowerCase() || "").includes(query) ||
      (p.membership?.plan?.name?.toLowerCase() || "").includes(query) ||
      (p.invoiceNumber?.toLowerCase() || "").includes(query) ||
      (p.reference?.toLowerCase() || "").includes(query) ||
      String(p.amount || "").includes(query) ||
      (p.method || "").toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (selectedMethod !== "ALL" && normalizeMethodKey(p.method) !== selectedMethod) {
      return false;
    }

    if (p.createdAt) {
      const paidDate = new Date(p.createdAt);
      if (dateFrom || dateTo) {
        if (dateFrom && paidDate < new Date(`${dateFrom}T00:00:00`)) return false;
        if (dateTo && paidDate > new Date(`${dateTo}T23:59:59`)) return false;
      } else if (periodPreset !== "ALL") {
        if (periodPreset === "TODAY" && paidDate < todayStart) return false;
        if (periodPreset === "MONTH" && paidDate < monthStart) return false;
        if (periodPreset === "30D" && paidDate < thirtyDaysAgo) return false;
      }
    }

    return true;
  });
}

export function summarizeByChannel(filteredPayments: any[]) {
  const totals: Record<MethodKey, { amount: number; count: number }> = {
    CASH: { amount: 0, count: 0 },
    YAPE_PLIN: { amount: 0, count: 0 },
    CARD: { amount: 0, count: 0 },
    TRANSFER: { amount: 0, count: 0 },
  };
  let grandTotal = 0;

  filteredPayments.forEach((p) => {
    const amount = Number(p.amount || 0);
    const key = normalizeMethodKey(p.method);
    totals[key].amount += amount;
    totals[key].count += 1;
    grandTotal += amount;
  });

  return { totals, grandTotal };
}

export function exportPaymentsCsv(filteredPayments: any[]) {
  const headers = ["Comprobante", "Socio", "Plan", "Metodo", "Monto", "Fecha"];
  const rows = filteredPayments.map((p) => [
    p.invoiceNumber || `F001-${String(p.id).substring(0, 4)}`,
    p.member?.fullName || "Cliente General",
    p.membership?.plan?.name || "Cobro General",
    p.method || "EFECTIVO",
    Number(p.amount || 0).toFixed(2),
    p.createdAt ? formatDate(p.createdAt, "yyyy-MM-dd HH:mm") : "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gymos-pagos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
