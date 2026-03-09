"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";

interface BirthInfoFormProps {
  onSubmit: (data: BirthInfo) => void;
  isLoading: boolean;
}

export interface BirthInfo {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  interests: string[];
  toneStyle: string;
}

const interestOptions = [
  { id: "love", label: "연애/관계" },
  { id: "career", label: "커리어" },
  { id: "health", label: "건강" },
  { id: "money", label: "재정" },
  { id: "mental", label: "멘탈" },
];

const toneOptions = [
  { id: "warm", label: "따뜻한 위로형", icon: "🎭" },
  { id: "intuitive", label: "직관적 공감형", icon: "💫" },
  { id: "direct", label: "팩트 직설형", icon: "🔥" },
];

const DEFAULT_BIRTH_DATE = "1990-01-01";

function toTwoDigits(n: number) {
  return String(n).padStart(2, "0");
}

function isValidISODateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [yStr, mStr, dStr] = value.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function normalizeBirthDateInput(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Accept: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // Accept: YYYYMMDD
  if (/^\d{8}$/.test(trimmed)) {
    return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`;
  }

  // Accept: YYYY/M/D, YYYY.M.D, YYYY-M-D
  const parts = trimmed.split(/[./-]/).filter(Boolean);
  if (parts.length === 3 && /^\d{4}$/.test(parts[0])) {
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
    return `${y}-${toTwoDigits(m)}-${toTwoDigits(d)}`;
  }

  return null;
}

export function BirthInfoForm({ onSubmit, isLoading }: BirthInfoFormProps) {
  const [formData, setFormData] = useState<BirthInfo>({
    birthDate: DEFAULT_BIRTH_DATE,
    birthTime: "",
    birthPlace: "",
    interests: [],
    toneStyle: "warm",
  });

  const [birthDateMode, setBirthDateMode] = useState<"picker" | "manual">("picker");
  const [manualBirthDate, setManualBirthDate] = useState(DEFAULT_BIRTH_DATE);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);

  const todayIso = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = toTwoDigits(today.getMonth() + 1);
    const d = toTwoDigits(today.getDate());
    return `${y}-${m}-${d}`;
  }, []);

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GlassCard>
        <h2 className="text-lg font-medium text-text-primary mb-4">
          출생 정보
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              생년월일 <span className="text-accent-purple">*</span>
            </label>
            <div className="space-y-2">
              {birthDateMode === "picker" ? (
                <input
                  type="date"
                  required
                  min="1900-01-01"
                  max={todayIso}
                  value={formData.birthDate}
                  onChange={(e) => {
                    setBirthDateError(null);
                    setFormData({ ...formData, birthDate: e.target.value });
                    setManualBirthDate(e.target.value);
                  }}
                  className={cn(
                    "w-full h-[52px] px-4 rounded-xl",
                    "bg-secondary border border-glass-border",
                    "text-text-primary placeholder:text-text-muted",
                    "focus:outline-none focus:border-accent-purple focus:shadow-[0_0_20px_rgba(139,127,212,0.2)]",
                    "transition-all duration-200"
                  )}
                />
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday"
                    placeholder="예: 1990-01-01 또는 19900101"
                    value={manualBirthDate}
                    onChange={(e) => {
                      const nextRaw = e.target.value;
                      setManualBirthDate(nextRaw);
                      setBirthDateError(null);

                      const normalized = normalizeBirthDateInput(nextRaw);
                      if (normalized && isValidISODateString(normalized)) {
                        if (normalized > todayIso) {
                          setBirthDateError("미래 날짜는 입력할 수 없어요.");
                          return;
                        }
                        if (normalized < "1900-01-01") {
                          setBirthDateError("1900년 이후 날짜를 입력해 주세요.");
                          return;
                        }
                        setFormData({ ...formData, birthDate: normalized });
                      }
                    }}
                    onBlur={() => {
                      const normalized = normalizeBirthDateInput(manualBirthDate);
                      if (!normalized) {
                        setBirthDateError("생년월일을 입력해 주세요. (YYYY-MM-DD)");
                        return;
                      }
                      if (!isValidISODateString(normalized)) {
                        setBirthDateError("올바른 날짜 형식이 아니에요. (YYYY-MM-DD)");
                        return;
                      }
                      if (normalized > todayIso) {
                        setBirthDateError("미래 날짜는 입력할 수 없어요.");
                        return;
                      }
                      if (normalized < "1900-01-01") {
                        setBirthDateError("1900년 이후 날짜를 입력해 주세요.");
                        return;
                      }

                      setBirthDateError(null);
                      setManualBirthDate(normalized);
                      setFormData({ ...formData, birthDate: normalized });
                    }}
                    aria-invalid={birthDateError ? "true" : "false"}
                    className={cn(
                      "w-full h-[52px] px-4 rounded-xl",
                      "bg-secondary border border-glass-border",
                      "text-text-primary placeholder:text-text-muted",
                      "focus:outline-none focus:border-accent-purple focus:shadow-[0_0_20px_rgba(139,127,212,0.2)]",
                      "transition-all duration-200",
                      birthDateError && "border-red-400/70 focus:border-red-400"
                    )}
                  />
                  {birthDateError && (
                    <p className="text-xs text-red-300">{birthDateError}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-text-muted">
                  빠르게 선택하려면 기본값(1990-01-01)에서 수정해 주세요.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBirthDateError(null);
                    setBirthDateMode((prev) => {
                      const next = prev === "picker" ? "manual" : "picker";
                      if (next === "manual") setManualBirthDate(formData.birthDate || DEFAULT_BIRTH_DATE);
                      return next;
                    });
                  }}
                  className={cn(
                    "text-xs px-3 py-1 rounded-full border transition-colors",
                    "border-glass-border text-text-secondary hover:border-glass-highlight"
                  )}
                >
                  {birthDateMode === "picker" ? "직접 입력" : "달력 선택"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              태어난 시간 <span className="text-text-muted">(선택)</span>
            </label>
            <input
              type="time"
              value={formData.birthTime}
              onChange={(e) =>
                setFormData({ ...formData, birthTime: e.target.value })
              }
              className={cn(
                "w-full h-[52px] px-4 rounded-xl",
                "bg-secondary border border-glass-border",
                "text-text-primary placeholder:text-text-muted",
                "focus:outline-none focus:border-accent-purple focus:shadow-[0_0_20px_rgba(139,127,212,0.2)]",
                "transition-all duration-200"
              )}
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              출생지 <span className="text-text-muted">(선택)</span>
            </label>
            <input
              type="text"
              placeholder="예: 서울, 부산..."
              value={formData.birthPlace}
              onChange={(e) =>
                setFormData({ ...formData, birthPlace: e.target.value })
              }
              className={cn(
                "w-full h-[52px] px-4 rounded-xl",
                "bg-secondary border border-glass-border",
                "text-text-primary placeholder:text-text-muted",
                "focus:outline-none focus:border-accent-purple focus:shadow-[0_0_20px_rgba(139,127,212,0.2)]",
                "transition-all duration-200"
              )}
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-medium text-text-primary mb-4">
          관심 영역
        </h2>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleInterest(option.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm transition-all duration-200",
                "border",
                formData.interests.includes(option.id)
                  ? "bg-accent-purple/15 border-accent-purple text-text-primary"
                  : "bg-transparent border-glass-border text-text-secondary hover:border-glass-highlight"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-medium text-text-primary mb-4">
          말투 선택
        </h2>
        <div className="space-y-2">
          {toneOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                setFormData({ ...formData, toneStyle: option.id })
              }
              className={cn(
                "w-full p-4 rounded-xl text-left transition-all duration-200",
                "flex items-center gap-3",
                formData.toneStyle === option.id
                  ? "bg-accent-purple/15 border border-accent-purple"
                  : "bg-secondary/50 border border-transparent hover:bg-secondary"
              )}
            >
              <span className="text-xl">{option.icon}</span>
              <span
                className={cn(
                  "text-sm",
                  formData.toneStyle === option.id
                    ? "text-text-primary"
                    : "text-text-secondary"
                )}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      <button
        type="submit"
        disabled={!formData.birthDate || isLoading}
        className={cn(
          "w-full h-14 rounded-2xl font-medium text-base",
          "bg-gradient-to-r from-accent-purple to-accent-teal",
          "text-white",
          "transition-all duration-200",
          "hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,127,212,0.3)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          "flex items-center justify-center gap-2"
        )}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            해석 중...
          </>
        ) : (
          <>
            <span>✦</span> 운세 생성하기
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() =>
          onSubmit({
            birthDate: "1995-03-15",
            birthTime: "14:30",
            birthPlace: "서울",
            interests: ["career", "love"],
            toneStyle: "warm",
          })
        }
        disabled={isLoading}
        className={cn(
          "w-full h-[52px] rounded-xl font-medium text-sm",
          "bg-transparent border border-glass-border",
          "text-text-secondary",
          "transition-all duration-200",
          "hover:bg-glass-bg"
        )}
      >
        샘플로 체험하기
      </button>
    </form>
  );
}
