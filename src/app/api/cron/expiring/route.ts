import { NextResponse } from "next/server";
import { processExpiringMembershipsAction } from "@/lib/actions/cron-actions";

export const runtime = "nodejs";

async function verifyCronAuth(request: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.trim() === "") {
    return false;
  }
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  const isAuthorized = await verifyCronAuth(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  const result = await processExpiringMembershipsAction();
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  
  return NextResponse.json(result);
}