import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PortalSidebar } from "@/components/shared/PortalSidebar";
import { NotificationCenter } from "@/components/shared/NotificationCenter";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Basic check: if user is not a member but is an admin, maybe allow? 
  // For now, assume any logged in user can see it but we might restrict later.

  return (
    <div className="flex min-h-screen bg-background premium-gradient overflow-x-hidden">
      <PortalSidebar />
      <main className="flex-1 md:ml-72 transition-all duration-500">
        <header className="flex h-20 items-center justify-end px-8 gap-4">
          <NotificationCenter />
        </header>
        <div className="w-full max-w-[100vw] px-4 sm:px-8 lg:px-12 py-4 mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
