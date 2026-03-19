"use client";

import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

interface FiveElementsData {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  analysis: {
    excess: { element: string; meaning: string } | null;
    deficient: { element: string; meaning: string } | null;
  };
}

interface FiveElementsChartProps {
  data: FiveElementsData;
}

const elementConfig = {
  wood: { label: "목", hanja: "木", color: "#6BCB77" },
  fire: { label: "화", hanja: "火", color: "#E57373" },
  earth: { label: "토", hanja: "土", color: "#DDB892" },
  metal: { label: "금", hanja: "金", color: "#E8E8E8" },
  water: { label: "수", hanja: "水", color: "#64B5F6" },
};

export function FiveElementsChart({ data }: FiveElementsChartProps) {
  const maxValue = Math.max(data.wood, data.fire, data.earth, data.metal, data.water, 1);
  const elements = [
    { key: "wood", value: data.wood },
    { key: "fire", value: data.fire },
    { key: "earth", value: data.earth },
    { key: "metal", value: data.metal },
    { key: "water", value: data.water },
  ] as const;

  return (
    <GlassCard badge={{ label: "오행 밸런스", variant: "gold" }}>
      {/* Pentagon Chart */}
      <div className="flex justify-center mb-6">
        <svg viewBox="0 0 200 200" className="w-40 h-40">
          {/* Background pentagon */}
          <polygon
            points={calculatePentagonPoints(80, 100, 100)}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
          <polygon
            points={calculatePentagonPoints(60, 100, 100)}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
          <polygon
            points={calculatePentagonPoints(40, 100, 100)}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
          <polygon
            points={calculatePentagonPoints(20, 100, 100)}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />

          {/* Data polygon */}
          <polygon
            points={calculateDataPoints(
              [data.wood, data.fire, data.earth, data.metal, data.water],
              maxValue,
              80,
              100,
              100
            )}
            fill="url(#elementGradient)"
            stroke="rgba(139, 127, 212, 0.8)"
            strokeWidth="2"
            opacity="0.8"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="elementGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 127, 212, 0.3)" />
              <stop offset="100%" stopColor="rgba(93, 189, 189, 0.3)" />
            </linearGradient>
          </defs>

          {/* Element labels */}
          {[
            { x: 100, y: 15, label: `${elementConfig.wood.hanja} (${data.wood})` },
            { x: 175, y: 70, label: `${elementConfig.fire.hanja} (${data.fire})` },
            { x: 150, y: 160, label: `${elementConfig.earth.hanja} (${data.earth})` },
            { x: 50, y: 160, label: `${elementConfig.metal.hanja} (${data.metal})` },
            { x: 25, y: 70, label: `${elementConfig.water.hanja} (${data.water})` },
          ].map((item, i) => (
            <text
              key={i}
              x={item.x}
              y={item.y}
              textAnchor="middle"
              className="text-xs fill-text-secondary"
              style={{ fontSize: "10px" }}
            >
              {item.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Bar Chart */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {elements.map(({ key, value }) => {
          const config = elementConfig[key];
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          return (
            <div key={key} className="flex flex-col items-center">
              <span className="text-xs text-text-muted mb-2">{config.label}</span>
              <div className="w-full h-16 bg-secondary/50 rounded-lg overflow-hidden flex flex-col-reverse">
                <div
                  className="transition-all duration-500"
                  style={{
                    height: `${percentage}%`,
                    backgroundColor: config.color,
                    opacity: 0.8,
                  }}
                />
              </div>
              <span className="text-xs text-text-secondary mt-2">{value}</span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-glass-border mb-4" />

      {/* Analysis — Phase 1: fallback when neither excess nor deficient */}
      <div className="space-y-2">
        {data.analysis?.excess && (
          <p className="text-sm flex items-start gap-2">
            <span className="text-caution">→</span>
            <span className="text-text-secondary">
              <span className="text-text-primary">{data.analysis.excess.element}</span>
              {" 과다: "}
              {data.analysis.excess.meaning}
            </span>
          </p>
        )}
        {data.analysis?.deficient && (
          <p className="text-sm flex items-start gap-2">
            <span className="text-accent-teal">→</span>
            <span className="text-text-secondary">
              <span className="text-text-primary">{data.analysis.deficient.element}</span>
              {" 부족: "}
              {data.analysis.deficient.meaning}
            </span>
          </p>
        )}
        {!data.analysis?.excess && !data.analysis?.deficient && (
          <p className="text-sm text-text-muted">오행이 고르게 분포되어 있어요.</p>
        )}
      </div>
    </GlassCard>
  );
}

function calculatePentagonPoints(radius: number, cx: number, cy: number): string {
  const points: string[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI / 2) + (2 * Math.PI * i) / 5;
    const x = cx + radius * Math.cos(angle);
    const y = cy - radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}

function calculateDataPoints(
  values: number[],
  maxValue: number,
  maxRadius: number,
  cx: number,
  cy: number
): string {
  const points: string[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI / 2) + (2 * Math.PI * i) / 5;
    const radius = (values[i] / maxValue) * maxRadius;
    const x = cx + radius * Math.cos(angle);
    const y = cy - radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}
