"use client";

import { Document, Page, View, StyleSheet } from "@react-pdf/renderer";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { Text } from "@/components/pdfx/text/pdfx-text";
import { PdfGraph } from "@/components/pdfx/graph/pdfx-graph";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/pdfx/table/pdfx-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
  },
  kpiCard: {
    width: "23%",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  section: {
    marginBottom: 30,
  },
  chartContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  chartHalf: {
    width: "48%",
  },
  heatmapContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  heatmapRow: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 5,
    alignItems: "center",
  },
  heatmapCell: {
    width: 60,
    height: 25,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    width: 40,
    color: "#6b7280",
    textAlign: "right",
  }
});

const days = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const hours = ["06h", "08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"];

export function ReportPDF({
  kpis,
  revenueByMonth,
  attendanceByDay,
  membershipsByPlan,
  membersByStatus,
  topMembers,
  startDate,
  endDate,
  generatedDate,
}: {
  kpis: any;
  revenueByMonth: any[];
  attendanceByDay: any[];
  membershipsByPlan: any[];
  membersByStatus: any[];
  topMembers: any[];
  startDate?: Date;
  endDate?: Date;
  generatedDate: string;
}) {
  const periodText = startDate && endDate 
    ? `Periodo: ${format(startDate, "dd/MM/yyyy", { locale: es })} - ${format(endDate, "dd/MM/yyyy", { locale: es })}`
    : `Periodo: Últimos 12 meses`;

  const revenueData = revenueByMonth.map((d) => ({
    label: d.month,
    value: d.revenue,
  }));

  const planData = membershipsByPlan.map((d) => ({
    label: d.plan,
    value: d.count,
    color: d.color || undefined,
  }));

  const statusData = membersByStatus.map((d) => ({
    label: d.status,
    value: d.count,
    color: d.color || undefined,
  }));

  // Heatmap data processing
  const heatmapData = Array.from({ length: 9 }, (_, hIndex) => {
    return Array.from({ length: 7 }, (_, dIndex) => {
      const index = hIndex * 7 + dIndex;
      return attendanceByDay[index]?.count || 0;
    });
  });

  const maxAttendance = Math.max(...attendanceByDay.map(d => d.count), 1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Heading level={1}>Reporte de Gestión GymOS</Heading>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text color="mutedForeground">{periodText}</Text>
            <Text color="mutedForeground" style={{ fontSize: 12 }}>Generado: {generatedDate}</Text>
          </View>
        </View>

        {/* KPIs */}
        <View style={styles.grid}>
          <View style={styles.kpiCard}>
            <Text color="mutedForeground" transform="uppercase" style={{ fontSize: 12 }}>Miembros Activos</Text>
            <Heading level={3} noMargin>{String(kpis.activeMembers)}</Heading>
          </View>
          <View style={styles.kpiCard}>
            <Text color="mutedForeground" transform="uppercase" style={{ fontSize: 12 }}>Ingresos Mes</Text>
            <Heading level={3} noMargin>{`S/ ${kpis.revenueThisMonth?.toLocaleString()}`}</Heading>
          </View>
          <View style={styles.kpiCard}>
            <Text color="mutedForeground" transform="uppercase" style={{ fontSize: 12 }}>Asistencia Hoy</Text>
            <Heading level={3} noMargin>{String(kpis.attendanceToday)}</Heading>
          </View>
          <View style={styles.kpiCard}>
            <Text color="mutedForeground" transform="uppercase" style={{ fontSize: 12 }}>Por Vencer</Text>
            <Heading level={3} noMargin>{String(kpis.expiringThisWeek)}</Heading>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.section}>
          <Heading level={4} style={{ marginBottom: 10 }}>Ingresos por Mes</Heading>
          <PdfGraph 
            variant="bar" 
            data={revenueData} 
            height={180}
            fullWidth
            colors={["#8b5cf6"]}
          />
        </View>

        {/* Distributions */}
        <View style={styles.chartContainer} wrap={false}>
          <View style={styles.chartHalf}>
            <Heading level={4} style={{ marginBottom: 10 }}>Membresías por Plan</Heading>
            <PdfGraph 
              variant="donut" 
              data={planData} 
              width={240}
              height={180}
              colors={["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899"]}
              centerLabel={`${membershipsByPlan.reduce((a, b) => a + b.count, 0)}`}
            />
          </View>
          <View style={styles.chartHalf}>
            <Heading level={4} style={{ marginBottom: 10 }}>Estado de Miembros</Heading>
            <PdfGraph 
              variant="donut" 
              data={statusData} 
              width={240}
              height={180}
              colors={["#10b981", "#ef4444", "#f59e0b", "#8b5cf6"]}
            />
          </View>
        </View>

        {/* Heatmap */}
        <View style={styles.section}>
          <Heading level={4} style={{ marginBottom: 10 }}>Mapa de Asistencia (30 días)</Heading>
          <View style={styles.heatmapContainer}>
            <View style={{ flexDirection: "row", marginLeft: 45, marginBottom: 5, gap: 5 }}>
              {days.map(day => (
                <Text key={day} style={{ width: 60, fontSize: 12, textAlign: "center", color: "#6b7280" }}>{day}</Text>
              ))}
            </View>
            {heatmapData.map((row, hIndex) => (
              <View key={`row-${hIndex}`} style={styles.heatmapRow}>
                <Text style={styles.label}>{hours[hIndex]}</Text>
                {row.map((val, dIndex) => {
                  const intensity = val / maxAttendance;
                  return (
                    <View 
                      key={`cell-${hIndex}-${dIndex}`} 
                      style={[
                        styles.heatmapCell, 
                        { backgroundColor: `rgba(139, 92, 246, ${Math.max(0.05, intensity)})` }
                      ]} 
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Top Members Table */}
        <View style={styles.section} break>
          <Heading level={4} style={{ marginBottom: 10 }}>Top 10 Miembros más Activos</Heading>
          <Table variant="line">
            <TableHeader>
              <TableRow header>
                <TableCell width="10%">Pos</TableCell>
                <TableCell width="50%">Nombre Completo</TableCell>
                <TableCell width="20%">DNI</TableCell>
                <TableCell width="20%" align="right">Visitas</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topMembers.slice(0, 10).map((m, i) => (
                <TableRow key={m.id || i}>
                  <TableCell width="10%">{String(i + 1)}</TableCell>
                  <TableCell width="50%">{String(m.fullName)}</TableCell>
                  <TableCell width="20%">{String(m.dni || "S/D")}</TableCell>
                  <TableCell width="20%" align="right">{String(m.visitCount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </View>
      </Page>
    </Document>
  );
}
