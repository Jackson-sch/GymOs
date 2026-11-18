"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SettingsTabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  setCurrentPage: (page: number) => void;
}

export function SettingsTabs({
  tabs,
  activeTab,
  setActiveTab,
  setCurrentPage,
}: SettingsTabsProps) {
  return (
    <aside className="xl:col-span-3">
      <nav
        aria-label="Secciones de configuración"
        className="glass-card border-border p-2 rounded-2xl flex xl:flex-col gap-1 overflow-x-auto no-scrollbar xl:sticky xl:top-6"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== activeTab) setCurrentPage(1);
              }}
              className={cn(
                "shrink-0 xl:w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors duration-200 text-xs sm:text-sm font-medium text-left",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              <tab.icon
                className={cn(
                  "size-4 shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground",
                )}
              />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
