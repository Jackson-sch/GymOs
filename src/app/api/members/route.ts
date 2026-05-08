import { NextResponse } from "next/server";
import { updateMemberAction } from "@/lib/actions/members-actions";

export async function PUT(req: Request) {
  try {
    const { id, ...data } = await req.json();
    const result = await updateMemberAction(id, data);
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
