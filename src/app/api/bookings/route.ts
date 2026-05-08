import { NextResponse } from "next/server";
import { getBookings, getBookingById, createBooking, cancelBooking, markAttended, markNoShow } from "@/lib/actions/bookings-actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const classId = searchParams.get("classId");
  const memberId = searchParams.get("memberId");
  
  if (id) {
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }
    return NextResponse.json(booking);
  }
  
  const bookings = await getBookings(classId || undefined, memberId || undefined);
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result: any = await createBooking(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json(result.data || { ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }
    
    let result: any;
    switch (action) {
      case "cancel":
        result = await cancelBooking(id);
        break;
      case "attended":
        result = await markAttended(id);
        break;
      case "noShow":
        result = await markNoShow(id);
        break;
      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}