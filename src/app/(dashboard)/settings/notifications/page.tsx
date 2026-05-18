import React from "react";
import { getAllAppNotificationsAction } from "@/lib/actions/notification-actions";
import { NotificationsClient } from "./NotificationsClient";
import { requireAdmin } from "@/lib/security";

export const metadata = {
  title: "Centro de Control de Comunicaciones | GymOS",
  description: "Auditoría en tiempo real de correos, SMS y notificaciones del sistema.",
};

export default async function NotificationsControlPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const typeFilter = typeof params?.type === "string" ? params.type : "ALL";
  const searchFilter = typeof params?.search === "string" ? params.search : "";

  const res = await getAllAppNotificationsAction(typeFilter, searchFilter);
  const initialNotifications = res.success && res.data ? res.data : [];

  return <NotificationsClient initialNotifications={initialNotifications} />;
}
