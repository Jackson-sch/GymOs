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
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Editorial */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <Activity className="size-4" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Monitor de Tráfico</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight text-foreground">Asistencia</h1>
        <p className="text-sm text-muted-foreground font-sans">
          Supervisando el flujo de socios en tiempo real para garantizar una <span className="text-foreground font-medium">experiencia fluida</span>.
        </p>
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
