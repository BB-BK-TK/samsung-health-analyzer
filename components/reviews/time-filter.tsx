"use client";

import { useMemo, useState } from "react";
import { formatISO, subDays, subMonths, subYears } from "date-fns";

export type TimePreset = "30d" | "3m" | "6m" | "1y" | "custom";

export interface TimeRangeValue {
  preset: TimePreset;
  startDate: Date;
  endDate: Date;
}

function toDateInputValue(d: Date): string {
  // yyyy-MM-dd
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fromDateInputValue(s: string): Date | null {
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function TimeFilter({
  value,
  onChange,
}: {
  value?: Partial<TimeRangeValue>;
  onChange: (next: TimeRangeValue) => void;
}) {
  const now = useMemo(() => new Date(), []);
  const [preset, setPreset] = useState<TimePreset>(value?.preset ?? "30d");

  const defaultRange = useMemo<TimeRangeValue>(() => {
    const endDate = value?.endDate ?? now;
    if (preset === "3m") return { preset, startDate: subMonths(endDate, 3), endDate };
    if (preset === "6m") return { preset, startDate: subMonths(endDate, 6), endDate };
    if (preset === "1y") return { preset, startDate: subYears(endDate, 1), endDate };
    if (preset === "custom") {
      const startDate = value?.startDate ?? subDays(endDate, 30);
      return { preset, startDate, endDate };
    }
    return { preset, startDate: subDays(endDate, 30), endDate };
  }, [now, preset, value?.endDate, value?.startDate]);

  const startInput = toDateInputValue(defaultRange.startDate);
  const endInput = toDateInputValue(defaultRange.endDate);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["30d", "Last 30 days"],
            ["3m", "3 months"],
            ["6m", "6 months"],
            ["1y", "1 year"],
            ["custom", "Custom"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setPreset(id);
              const endDate = new Date();
              const next =
                id === "3m"
                  ? { preset: id, startDate: subMonths(endDate, 3), endDate }
                  : id === "6m"
                    ? { preset: id, startDate: subMonths(endDate, 6), endDate }
                    : id === "1y"
                      ? { preset: id, startDate: subYears(endDate, 1), endDate }
                      : id === "custom"
                        ? { preset: id, startDate: subDays(endDate, 30), endDate }
                        : { preset: id, startDate: subDays(endDate, 30), endDate };
              onChange(next);
            }}
            className={[
              "px-3 py-2 rounded-lg text-sm border transition-colors",
              preset === id ? "bg-secondary border-glass-border text-text-primary" : "bg-transparent border-glass-border text-text-secondary hover:bg-secondary/60",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex flex-col gap-1 text-sm text-text-secondary">
            Start
            <input
              type="date"
              value={startInput}
              onChange={(e) => {
                const d = fromDateInputValue(e.target.value);
                if (!d) return;
                onChange({ preset: "custom", startDate: d, endDate: defaultRange.endDate });
              }}
              className="h-10 px-3 rounded-lg border border-glass-border bg-secondary/40 text-text-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-secondary">
            End
            <input
              type="date"
              value={endInput}
              onChange={(e) => {
                const d = fromDateInputValue(e.target.value);
                if (!d) return;
                onChange({ preset: "custom", startDate: defaultRange.startDate, endDate: d });
              }}
              className="h-10 px-3 rounded-lg border border-glass-border bg-secondary/40 text-text-primary"
            />
          </label>
        </div>
      )}

      <p className="text-xs text-text-muted">
        Range: {formatISO(defaultRange.startDate, { representation: "date" })} → {formatISO(defaultRange.endDate, { representation: "date" })}
      </p>
    </div>
  );
}

