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

export function SettingsTabs({ tabs, activeTab, setActiveTab, setCurrentPage }: SettingsTabsProps) {
  return (
    <div className="lg:col-span-3 space-y-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            if (tab.id !== activeTab) setCurrentPage(1);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium",
            activeTab === tab.id
              ? "bg-white/5 border border-white/10 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5",
          )}
        >
          <tab.icon
            className={cn(
              "size-4",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground",
            )}
          />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
