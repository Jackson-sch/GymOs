import { 
  getDashboardKPIs, 
  getRevenueByMonth, 
  getAttendanceByDay,
  getMembershipsByPlan,
  getMembersByStatus,
  getTopMembers
} from "@/lib/actions/reports-actions";
import { ReportsClient } from "./ReportsClient";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  
  const startDate = from ? new Date(from + "T00:00:00") : undefined;
  const endDate = to ? new Date(to + "T23:59:59") : undefined;

  const [kpis, revenueByMonth, attendanceByDay, membershipsByPlan, membersByStatus, topMembers] = await Promise.all([
    getDashboardKPIs(),
    getRevenueByMonth(startDate, endDate),
    getAttendanceByDay(startDate, endDate),
    getMembershipsByPlan(),
    getMembersByStatus(),
    getTopMembers(10, startDate, endDate),
  ]);
  
  return (
    <ReportsClient
      kpis={kpis}
      revenueByMonth={revenueByMonth}
      attendanceByDay={attendanceByDay}
      membershipsByPlan={membershipsByPlan}
      membersByStatus={membersByStatus}
      topMembers={topMembers}
    />
  );
}