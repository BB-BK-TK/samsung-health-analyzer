"use client";

import { cn } from "@/lib/utils";

interface ResultTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "today", label: "오늘" },
  { id: "week", label: "이번주" },
  { id: "month", label: "이번달" },
  { id: "year", label: "올해" },
];

export function ResultTabs({ activeTab, onTabChange }: ResultTabsProps) {
  return (
    <div className="flex border-b border-glass-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 py-3 text-sm transition-all duration-200 relative",
            activeTab === tab.id
              ? "text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold" />
          )}
        </button>
      ))}
    </div>
  );
}
