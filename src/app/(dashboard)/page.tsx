"use client";

import React, { useEffect, useReducer } from "react";
import {
  getAttendanceHeatmap,
  getCurrentOccupancyAction,
  getDashboardStats,
  getPlanComposition,
  getRecentActivity,
  getRevenueData,
  getWeeklyAttendance,
} from "@/lib/actions/dashboard";
import { getBranchAnalyticsAction } from "@/lib/actions/branch-actions";
import { getMaintenanceAlerts } from "@/lib/actions/inventory-actions";
import { useBranchStore } from "@/store/use-branch-store";
import { DashboardAnalytics } from "./components/DashboardAnalytics";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardKpis } from "./components/DashboardKpis";
import { MaintenanceAlertsCard } from "./components/MaintenanceAlertsCard";
import { QuickActionsBar } from "./components/QuickActionsBar";

const dashboardReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, ...action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_MOUNTED":
      return { ...state, mounted: action.payload };
    default:
      return state;
  }
};

const initialState = {
  mounted: false,
  loading: false,
  stats: null,
  revenueData: [],
  planData: [],
  activityData: [],
  heatmapData: undefined,
  weeklyData: [],
  maintenanceAlerts: [],
  occupancy: { percentage: 0, count: 0 },
};

export default function DashboardPage() {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const {
    mounted,
    loading,
    stats,
    revenueData,
    planData,
    activityData,
    heatmapData,
    weeklyData,
    maintenanceAlerts,
    occupancy,
  } = state;

  const { selectedBranchId, branches, setSelectedBranchId, setBranches } =
    useBranchStore();

  useEffect(() => {
    dispatch({ type: "SET_MOUNTED", payload: true });
    getBranchAnalyticsAction().then((res) => {
      if (res.success && res.data) {
        setBranches(res.data);
      }
    });
  }, [setBranches]);

  useEffect(() => {
    let isMounted = true;
    dispatch({ type: "SET_LOADING", payload: true });

    const fetchData = async () => {
      const [s, r, p, a, h, w, m, o] = await Promise.all([
        getDashboardStats(selectedBranchId),
        getRevenueData(selectedBranchId),
        getPlanComposition(selectedBranchId),
        getRecentActivity(selectedBranchId),
        getAttendanceHeatmap(selectedBranchId),
        getWeeklyAttendance(selectedBranchId),
        getMaintenanceAlerts(selectedBranchId),
        getCurrentOccupancyAction(selectedBranchId),
      ]);

      if (isMounted) {
        dispatch({
          type: "SET_DATA",
          payload: {
            stats: s,
            revenueData: r,
            planData: p,
            activityData: a,
            heatmapData: h,
            weeklyData: w,
            maintenanceAlerts: m.success ? (m.data as any[]) : [],
            occupancy: o.success
              ? { percentage: o.percentage, count: o.count }
              : { percentage: 0, count: 0 },
            loading: false,
          },
        });
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedBranchId]);

  const selectedBranchName =
    selectedBranchId === "ALL"
      ? "Todas las Sedes (Consolidado)"
      : branches.find((b) => b.id === selectedBranchId)?.name || "Sede Seleccionada";

  if (!mounted) {
    return <div className="w-full aspect-video animate-pulse bg-white/5 rounded-3xl" />;
  }

  return (
    <div className="space-y-8 animate-fade-in w-full pb-8">
      <DashboardHeader
        selectedBranchId={selectedBranchId}
        selectedBranchName={selectedBranchName}
        branches={branches}
        loading={loading}
        onBranchChange={setSelectedBranchId}
      />

      <DashboardKpis stats={stats} loading={loading} />

      <QuickActionsBar
        selectedBranchId={selectedBranchId}
        selectedBranchName={selectedBranchName}
      />

      <MaintenanceAlertsCard
        alerts={maintenanceAlerts}
        selectedBranchName={selectedBranchName}
      />

      <DashboardAnalytics
        revenueData={revenueData}
        planData={planData}
        weeklyData={weeklyData}
        activityData={activityData}
        heatmapData={heatmapData}
        occupancy={occupancy}
        selectedBranchName={selectedBranchName}
      />
    </div>
  );
}
