import { NextResponse } from "next/server";
import { processExpiringMembershipsAction, processExpiredMembershipsAction } from "@/lib/actions/cron-actions";

function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.trim() === "") {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader === `Bearer ${secret}`) {
    return true;
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (token && token === secret) {
    return true;
  }

  return false;
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado: CRON_SECRET inválido o no configurado" }, { status: 401 });
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

