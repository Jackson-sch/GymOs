"use server";

import { prisma } from "@/lib/prisma";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfDay, 
  endOfDay,
  startOfWeek,
  endOfWeek,
  subMonths,
  subDays,
  eachDayOfInterval,
  format,
  isWithinInterval
} from "date-fns";
import { verifySession } from "@/lib/security";

export async function getDashboardKPIs() {
  await verifySession();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const [
    activeMembers, 
    newMembersThisMonth, 
    revenueThisMonth, 
    revenueLastMonth, 
    expensesThisMonth,
    expensesLastMonth,
    attendanceToday, 
    attendanceThisWeek, 
    expiringThisWeek, 
    classesToday, 
    totalMembers
  ] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.member.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED", paidAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { 
        status: "COMPLETED", 
        paidAt: { 
          gte: subMonths(monthStart, 1), 
          lte: subMonths(monthEnd, 1) 
        } 
      },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { status: "COMPLETED", date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { 
        status: "COMPLETED", 
        date: { 
          gte: subMonths(monthStart, 1), 
          lte: subMonths(monthEnd, 1) 
        } 
      },
      _sum: { amount: true },
    }),
    prisma.attendance.count({
      where: { checkIn: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.attendance.count({
      where: { checkIn: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.membership.count({
      where: {
        status: "ACTIVE",
        endDate: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.class.count({
      where: {
        startTime: { gte: todayStart, lte: todayEnd },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.member.count(),
  ]);

  const currentRevenue = revenueThisMonth._sum.amount ? Number(revenueThisMonth._sum.amount) : 0;
  const lastRevenue = revenueLastMonth._sum.amount ? Number(revenueLastMonth._sum.amount) : 0;
  
  const currentExpenses = expensesThisMonth._sum.amount ? Number(expensesThisMonth._sum.amount) : 0;
  const lastExpenses = expensesLastMonth._sum.amount ? Number(expensesLastMonth._sum.amount) : 0;

  const currentNet = currentRevenue - currentExpenses;
  const lastNet = lastRevenue - lastExpenses;

  const revenueGrowth = lastNet > 0 ? ((currentNet - lastNet) / lastNet) * 100 : 0;

  return {
    activeMembers,
    newMembersThisMonth,
    revenueThisMonth: currentNet,
    revenueGrowth: revenueGrowth.toFixed(1),
    attendanceToday,
    attendanceThisWeek,
    expiringThisWeek,
    classesToday,
    totalMembers,
    retentionRate: totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) : "0",
  };
}

export async function getRevenueByMonth(startDate?: Date, endDate?: Date) {
  await verifySession();
  const end = endDate || new Date();
  const start = startDate || subMonths(end, 11);
  const data = [];
  
  // Calculate months between start and end
  let current = startOfMonth(start);
  while (current <= end) {
    const monthStart = startOfMonth(current);
    const monthEnd = endOfMonth(current);
    
    const [revenueResult, expenseResult] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "COMPLETED", paidAt: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { status: "COMPLETED", date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      })
    ]);

    const revenue = revenueResult._sum.amount ? Number(revenueResult._sum.amount) : 0;
    const expenses = expenseResult._sum.amount ? Number(expenseResult._sum.amount) : 0;
    
    data.push({
      month: format(monthStart, "MMM yyyy"),
      revenue: revenue - expenses,
      grossRevenue: revenue,
      expenses: expenses,
    });

    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }
  
  return data;
}

export async function getAttendanceByDay(startDate?: Date, endDate?: Date) {
  await verifySession();
  const end = endDate || new Date();
  const start = startDate || subDays(end, 29);
  
  const attendances = await prisma.attendance.findMany({
    where: { checkIn: { gte: start, lte: end } },
    select: { checkIn: true },
  });
  
  const daysData = eachDayOfInterval({ start, end });
  
  return daysData.map(day => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const count = attendances.filter(a => 
      isWithinInterval(a.checkIn, { start: dayStart, end: dayEnd })
    ).length;
    
    return {
      date: format(day, "dd MMM"),
      dayOfWeek: format(day, "EEE"),
      count,
    };
  });
}

export async function getMembershipsByPlan() {
  await verifySession();
  const memberships = await prisma.membership.findMany({
    where: { status: "ACTIVE" },
    include: { plan: true },
  });
  
  const planCounts: Record<string, number> = {};
  const planColors: Record<string, string> = {};
  
  for (const m of memberships) {
    const planName = m.plan.name;
    planCounts[planName] = (planCounts[planName] || 0) + 1;
    
    if (m.plan.color) {
      planColors[planName] = m.plan.color;
    }
  }
  
  return Object.entries(planCounts).map(([plan, count]) => ({
    plan,
    count,
    color: planColors[plan] || "#888888",
  }));
}

export async function getMembersByStatus() {
  await verifySession();
  const [active, inactive, suspended] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.member.count({ where: { status: "INACTIVE" } }),
    prisma.member.count({ where: { status: "SUSPENDED" } }),
  ]);
  
  return [
    { status: "Activos", count: active, color: "#22c55e" },
    { status: "Inactivos", count: inactive, color: "#6b7280" },
    { status: "Suspendidos", count: suspended, color: "#ef4444" },
  ];
}

export async function getTopMembers(limit = 10, startDate?: Date, endDate?: Date) {
  await verifySession();
  const start = startDate || startOfMonth(new Date());
  const end = endDate || new Date();
  
  const attendances = await prisma.attendance.groupBy({
    by: ["memberId"],
    where: { checkIn: { gte: start, lte: end } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });
  
  const memberIds = attendances.map(a => a.memberId);
  const members = await prisma.member.findMany({
    where: { id: { in: memberIds } },
  });
  
  const memberMap = new Map(members.map(m => [m.id, m]));
  
  return attendances.map(a => ({
    ...memberMap.get(a.memberId),
    visitCount: a._count.id,
  })).filter(m => m.id);
}

export async function getClassStats() {
  await verifySession();
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  
  const [totalClasses, completedClasses, totalBookings, attendedBookings] = await Promise.all([
    prisma.class.count({
      where: { startTime: { gte: weekStart, lte: weekEnd }, status: { not: "CANCELLED" } },
    }),
    prisma.class.count({
      where: { startTime: { gte: weekStart, lte: weekEnd }, status: "COMPLETED" },
    }),
    prisma.classBooking.count({
      where: { class: { startTime: { gte: weekStart, lte: weekEnd } } },
    }),
    prisma.classBooking.count({
      where: { class: { startTime: { gte: weekStart, lte: weekEnd } }, status: "ATTENDED" },
    }),
  ]);
  
  return { totalClasses, completedClasses, totalBookings, attendedBookings };
}