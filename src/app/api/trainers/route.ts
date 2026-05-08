import { NextResponse } from "next/server";
import { getTrainers, getTrainerById, createTrainer, updateTrainer, deleteTrainer } from "@/lib/actions/trainers-actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (id) {
    const trainer = await getTrainerById(id);
    if (!trainer) {
      return NextResponse.json({ error: "Entrenador no encontrado" }, { status: 404 });
    }
    return NextResponse.json(trainer);
  }
  
  const trainers = await getTrainers();
  return NextResponse.json(trainers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createTrainer(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }
    
    const result = await updateTrainer(id, data);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json(result.data);
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
    
    const result = await deleteTrainer(id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}