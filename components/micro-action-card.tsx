"use client";

import { useState } from "react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

interface MicroAction {
  id: string;
  text: string;
  tag: string;
}

interface MicroActionCardProps {
  actions: MicroAction[];
}

export function MicroActionCard({ actions }: MicroActionCardProps) {
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const toggleAction = (id: string) => {
    setCompletedActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const completedCount = completedActions.length;
  const totalCount = actions.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          오늘의 실천
        </h2>
      </div>

      <p className="text-sm text-text-secondary mb-6">
        완료 시 우주 에너지가 충전됩니다 ✦
      </p>

      <div className="space-y-3 mb-6">
        {(actions?.length ? actions : [{ id: "fallback", text: "오늘 한 가지라도 자신에게 맞는 일을 해보세요.", tag: "일상" }]).map((action) => {
          const isCompleted = completedActions.includes(action.id);
          return (
            <button
              key={action.id}
              onClick={() => toggleAction(action.id)}
              className={cn(
                "w-full p-4 rounded-xl text-left transition-all duration-300",
                "bg-secondary/50 border",
                isCompleted
                  ? "border-positive/30"
                  : "border-transparent hover:bg-secondary"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                    "transition-all duration-300",
                    isCompleted
                      ? "bg-accent-purple border-accent-purple"
                      : "border-text-muted"
                  )}
                >
                  {isCompleted && (
                    <svg
                      className="w-3 h-3 text-white animate-in zoom-in duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-sm transition-all duration-300",
                      isCompleted
                        ? "text-text-muted line-through"
                        : "text-text-primary"
                    )}
                  >
                    {action.text}
                  </p>
                  <span className="text-xs text-accent-teal">#{action.tag}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="pt-4 border-t border-glass-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-muted">에너지 게이지</span>
          <span className="text-xs text-text-secondary font-mono">{percentage}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              background: "linear-gradient(90deg, #8B7FD4, #5DBDBD)",
            }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
