import { NextResponse } from "next/server";
import { processExpiringMembershipsAction, processExpiredMembershipsAction } from "@/lib/actions/cron-actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // Verificar el token de seguridad
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  console.log("[CRON] Iniciando procesamiento automático de membresías...");

  try {
    const [expiring, expired] = await Promise.all([
      processExpiringMembershipsAction(),
      processExpiredMembershipsAction()
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        expiring,
        expired
      }
    });
  } catch (error: any) {
    console.error("[CRON] Error crítico:", error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
