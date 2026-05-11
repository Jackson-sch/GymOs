"use server";

import { prisma } from "../../../prisma";
import { startOfMonth, subMonths, format, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

export async function getDashboardStats() {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));

  const [
    activeMembers,
    newMembersThisMonth,
    newMembersLastMonth,
    revenueThisMonth,
    revenueLastMonth,
    attendanceToday
  ] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.member.count({
      where: { createdAt: { gte: currentMonthStart } }
    }),
    prisma.member.count({
      where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } }
    }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED", paidAt: { gte: currentMonthStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED", paidAt: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { amount: true },
    }),
    prisma.attendance.count({
      where: {
        checkIn: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  const revThis = Number(revenueThisMonth._sum.amount || 0);
  const revPrev = Number(revenueLastMonth._sum.amount || 0);
  const revenueTrend = revPrev > 0 
    ? `${((revThis - revPrev) / revPrev * 100).toFixed(1)}%` 
    : "+100%";

  const memThis = newMembersThisMonth;
  const memPrev = newMembersLastMonth;
  const memberTrend = memPrev > 0 
    ? `${((memThis - memPrev) / memPrev * 100).toFixed(1)}%` 
    : "+100%";

  return {
    totalMembers: activeMembers,
    revenue: revThis,
    attendanceToday,
    newMembers: memThis,
    revenueTrend: (revThis >= revPrev ? "+" : "") + revenueTrend,
    activeTrend: (memThis >= memPrev ? "+" : "") + memberTrend,
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
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.attendance.findMany({
      take: 10,
      orderBy: { checkIn: "desc" },
      include: { member: true },
    }),
  ]);

  const activities = [
    ...auditLogs.map((log) => ({
      user: log.user.name,
      action: log.action.replace(/_/g, " "),
      date: log.createdAt,
      type: log.action.includes("CREATE") ? "MEMBER_CREATE" : 
            log.action.includes("PAYMENT") ? "PAYMENT" : "SYSTEM_UPDATE",
      status: "accent" as const,
    })),
    ...attendances.map((att) => ({
      user: att.member.fullName,
      action: "Check-in",
      date: att.checkIn,
      type: "ATTENDANCE",
      status: "emerald" as const,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

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

export async function getCurrentOccupancyAction() {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const activeCheckins = await prisma.attendance.count({
      where: {
        checkIn: { gte: twoHoursAgo }
      }
    });

    // Default capacity is 50, but we could fetch this from Settings
    const maxCapacity = 50; 
    const percentage = Math.min(100, Math.round((activeCheckins / maxCapacity) * 100));

    return { success: true, percentage, count: activeCheckins };
  } catch (error) {
    return { success: false, percentage: 0, count: 0 };
  }
}
