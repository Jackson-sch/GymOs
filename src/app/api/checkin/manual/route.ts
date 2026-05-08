import { NextResponse } from "next/server";
import { searchMembersAction } from "@/lib/actions/members-actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  
  if (!query) {
    return NextResponse.json({ error: "Query requerida" }, { status: 400 });
  }
  
  const result = await searchMembersAction(query);
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  
  return NextResponse.json(result.data);
}