import { NextRequest, NextResponse } from "next/server";
import { 
  processExpiringMembershipsAction, 
  processExpiredMembershipsAction,
  processEquipmentMaintenanceAction 
} from "@/lib/actions/cron-actions";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!secret || secret.trim() === "" || authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    console.log("[CRON] Iniciando verificación diaria...");
    
    const [expiring, expired, maintenance] = await Promise.all([
      processExpiringMembershipsAction(),
      processExpiredMembershipsAction(),
      processEquipmentMaintenanceAction()
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        expiring,
        expired,
        maintenance
      }
    });
  } catch (error: any) {
    console.error("[CRON] Error crítico:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

