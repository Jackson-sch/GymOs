import { getMemberAction } from "@/lib/actions/members-actions";
import { MemberProfileClient } from "./MemberProfileClient";
import { notFound } from "next/navigation";

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getMemberAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <MemberProfileClient member={result.data} />;
}
