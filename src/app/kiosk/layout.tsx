import React from "react";

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background overflow-hidden flex items-center justify-center">
      {children}
    </div>
  );
}
