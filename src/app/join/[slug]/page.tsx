import React from "react";
import { notFound } from "next/navigation";
import { getPublicGymInfoAction } from "@/lib/actions/public-checkout-actions";
import { JoinClient } from "./JoinClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getPublicGymInfoAction(slug);

  if (!res.success || !res.data) {
    return {
      title: "Inscripción | GymOS",
    };
  }

  return {
    title: `Inscripción Online | ${res.data.name}`,
    description: `Únete a ${res.data.name} y activa tu membresía online de forma segura e instantánea.`,
  };
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getPublicGymInfoAction(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  return <JoinClient organization={res.data} />;
}
