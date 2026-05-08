import React from "react";
import { getSystemConfigAction } from "@/lib/actions/settings-actions";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const result = await getSystemConfigAction();
  const configs = result.success ? result.data : [];

  return <SettingsClient initialData={configs as any[]} />;
}
