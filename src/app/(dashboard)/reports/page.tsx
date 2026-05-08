import { 
  getDashboardKPIs, 
  getRevenueByMonth, 
  getAttendanceByDay,
  getMembershipsByPlan,
  getMembersByStatus,
  getTopMembers
} from "@/lib/actions/reports-actions";
import { ReportsClient } from "./ReportsClient";

export default async function ReportsPage() {
  const [kpis, revenueByMonth, attendanceByDay, membershipsByPlan, membersByStatus, topMembers] = await Promise.all([
    getDashboardKPIs(),
    getRevenueByMonth(12),
    getAttendanceByDay(30),
    getMembershipsByPlan(),
    getMembersByStatus(),
    getTopMembers(10),
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