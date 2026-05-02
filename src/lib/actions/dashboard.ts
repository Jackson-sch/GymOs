"use server";

import { prisma } from "../../../prisma";
import { startOfMonth, subMonths, format, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

export async function getDashboardStats() {
  const [totalMembers, activeMembers, totalRevenue] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
  ]);

  const today = new Date();
  const attendanceToday = await prisma.attendance.count({
    where: {
      checkIn: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    },
  });

  return {
    totalMembers: activeMembers,
    revenue: Number(totalRevenue._sum.amount || 0),
    attendanceToday,
    newMembers: 24, // Mock for now or we could calculate
    revenueTrend: "+12.5%",
    activeTrend: "+5.2%",
  };
}

export async function getRevenueData() {
  const months = Array.from({ length: 6 }).map((_, i) => subMonths(new Date(), 5 - i));
  
  const revenueByMonth = await Promise.all(
    months.map(async (month) => {
      const result = await prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          paidAt: {
            gte: startOfMonth(month),
            lte: endOfMonth(month),
          },
        },
        _sum: { amount: true },
      });
      return {
        key: format(month, "MMM", { locale: es }).toUpperCase(),
        value: Number(result._sum.amount || 0),
      };
    })
  );

  return revenueByMonth;
}

export async function getPlanComposition() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { memberships: { where: { status: "ACTIVE" } } },
      },
    },
  });

  const total = plans.reduce((acc, p) => acc + p._count.memberships, 0);

  return plans.map((p) => ({
    label: p.name,
    value: total > 0 ? Math.round((p._count.memberships / total) * 100) : 0,
    color: p.color || "oklch(60% 0.1 250)",
  }));
}

export async function getRecentActivity() {
  const [auditLogs, attendances] = await Promise.all([
    prisma.auditLog.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.attendance.findMany({
      take: 4,
      orderBy: { checkIn: "desc" },
      include: { member: true },
    }),
  ]);

  const activities = [
    ...auditLogs.map((log) => ({
      user: log.user.name,
      action: log.action.replace("_", " "),
      time: format(log.createdAt, "HH:mm"),
      status: "accent" as const,
    })),
    ...attendances.map((att) => ({
      user: att.member.fullName,
      action: "Check-in",
      time: format(att.checkIn, "HH:mm"),
      status: "emerald" as const,
    })),
  ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

  return activities;
}

export async function getAttendanceHeatmap() {
  const attendances = await prisma.attendance.findMany({
    where: {
      checkIn: {
        gte: subMonths(new Date(), 1),
      },
    },
  });

  const heatmap = Array.from({ length: 9 }, () => Array(7).fill(0));
  
  attendances.forEach((att) => {
    const day = (att.checkIn.getDay() + 6) % 7;
    const hour = att.checkIn.getHours();
    
    let hIndex = -1;
    if (hour >= 6 && hour < 8) hIndex = 0;
    else if (hour >= 8 && hour < 10) hIndex = 1;
    else if (hour >= 10 && hour < 12) hIndex = 2;
    else if (hour >= 12 && hour < 14) hIndex = 3;
    else if (hour >= 14 && hour < 16) hIndex = 4;
    else if (hour >= 16 && hour < 18) hIndex = 5;
    else if (hour >= 18 && hour < 20) hIndex = 6;
    else if (hour >= 20 && hour < 22) hIndex = 7;
    else if (hour >= 22 || hour < 6) hIndex = 8;

    if (hIndex !== -1) {
      heatmap[hIndex][day]++;
    }
  });

  const maxVal = Math.max(...heatmap.flat()) || 1;
  const normalized = heatmap.map((row) => row.map((val) => val / maxVal));

  return normalized;
}

export async function getWeeklyAttendance() {
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const data = await Promise.all(
    last7Days.map(async (date) => {
      const count = await prisma.attendance.count({
        where: {
          checkIn: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lte: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
      });
      return {
        name: format(date, "EEE", { locale: es }).toUpperCase(),
        value: count,
      };
    })
  );

  return data;
}
