import { NextResponse } from "next/server";
import { getBodyMetrics, getLatestBodyMetric, createBodyMetric, updateBodyMetric, deleteBodyMetric } from "@/lib/actions/body-metrics-actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");
  const latest = searchParams.get("latest");
  
  if (!memberId) {
    return NextResponse.json({ error: "memberId requerido" }, { status: 400 });
  }
  
  if (latest === "true") {
    const metric = await getLatestBodyMetric(memberId);
    return NextResponse.json(metric);
  }
  
  const metrics = await getBodyMetrics(memberId);
  return NextResponse.json(metrics);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createBodyMetric(body);
    
    if (!result || !(result as any).success) {
      return NextResponse.json({ success: false, error: (result as any).error || "Error al crear" }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data: (result as any).data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    
    const result = await updateBodyMetric(id, data);
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }
    
    const result = await deleteBodyMetric(id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}