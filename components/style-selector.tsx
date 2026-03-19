"use client";

import { cn } from "@/lib/utils";
import { getStylePresets, NO_STYLE_KEY, type StyleOption } from "@/lib/data";

export { NO_STYLE_KEY };
export type { StyleOption };

interface StyleSelectorProps {
  value: StyleOption;
  onChange: (style: StyleOption) => void;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function StyleSelector({
  value,
  onChange,
  disabled,
  isLoading,
  error,
  onRetry,
  className,
}: StyleSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">표현 스타일</span>
        {isLoading && (
          <span className="text-xs text-accent-gold animate-pulse">변환 중…</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {getStylePresets().map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled || isLoading}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "border",
              value === opt.value
                ? "bg-accent-purple/20 border-accent-purple/50 text-text-primary"
                : "bg-glass-bg border-glass-border text-text-secondary hover:border-glass-border-hover hover:text-text-primary",
              (disabled || isLoading) && "opacity-60 cursor-not-allowed"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-caution">{error}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-accent-purple hover:underline"
            >
              다시 시도
            </button>
          )}
        </div>
      )}
    </div>
  );
}
