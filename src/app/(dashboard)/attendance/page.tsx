import React from "react";
import { getRecentAttendanceAction, getCurrentOccupancyAction, getAttendanceDashboardStatsAction } from "@/lib/actions/attendance-actions";
import { getMembersAction } from "@/lib/actions/members-actions";
import { Activity } from "lucide-react";
import { AttendanceClient } from "./AttendanceClient";

export default async function AttendancePage() {
  const [attendanceRes, membersRes, occupancyRes, statsRes] = await Promise.all([
    getRecentAttendanceAction(),
    getMembersAction(),
    getCurrentOccupancyAction(),
    getAttendanceDashboardStatsAction()
  ]);

  const history = attendanceRes.success ? (attendanceRes.data as any[]) : [];
  const members = membersRes.success ? (membersRes.data as any[]) : [];
  const occupancy = occupancyRes.success ? occupancyRes.count || 0 : 0;
  const stats = statsRes.success ? statsRes.stats : { totalToday: 0, birthdaysToday: 0, planDistribution: [] };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500">
            <Activity className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Monitor de Tráfico</span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Asistencia</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Supervisando el flujo de socios en tiempo real para garantizar una <span className="text-foreground font-medium">experiencia fluida</span>.
          </p>
        </div>
      </div>

      {/* Main Client Component */}
      <AttendanceClient 
        history={history} 
        members={members} 
        occupancy={occupancy} 
        stats={stats}
      />
    </div>
  );
}
