"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";
import { getStylePresets, NO_STYLE_KEY } from "@/lib/data";
import type { StyleOption } from "@/lib/data";

interface BirthInfoFormProps {
  onSubmit: (data: BirthInfo) => void;
  isLoading: boolean;
}

export interface BirthInfo {
  name: string;
  calendarType: "solar" | "lunar";
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  interests: string[];
  /** Expression style chosen at input; used for result (no toggle in output). */
  toneStyle: StyleOption;
}

const interestOptions = [
  { id: "career_money", label: "커리어/돈" },
  { id: "love_relationship", label: "연애/관계" },
  { id: "health", label: "건강" },
  { id: "family", label: "가족" },
  { id: "mental", label: "멘탈" },
  { id: "overall", label: "총운" },
];


const DEFAULT_BIRTH_DATE = "1990-01-01";

const birthTimeOptions = [
  { value: "", label: "모름 (선택 안 함)" },
  { value: "23:30", label: "자시 (23:00-00:59)" },
  { value: "01:30", label: "축시 (01:00-02:59)" },
  { value: "03:30", label: "인시 (03:00-04:59)" },
  { value: "05:30", label: "묘시 (05:00-06:59)" },
  { value: "07:30", label: "진시 (07:00-08:59)" },
  { value: "09:30", label: "사시 (09:00-10:59)" },
  { value: "11:30", label: "오시 (11:00-12:59)" },
  { value: "13:30", label: "미시 (13:00-14:59)" },
  { value: "15:30", label: "신시 (15:00-16:59)" },
  { value: "17:30", label: "유시 (17:00-18:59)" },
  { value: "19:30", label: "술시 (19:00-20:59)" },
  { value: "21:30", label: "해시 (21:00-22:59)" },
] as const;

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
    name: "",
    calendarType: "solar",
    birthDate: DEFAULT_BIRTH_DATE,
    birthTime: "",
    birthPlace: "",
    interests: [],
    toneStyle: NO_STYLE_KEY,
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
              이름
            </label>
            <input
              type="text"
              placeholder="예: 홍길동"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(
                "w-full h-[52px] px-4 rounded-xl",
                "bg-secondary border border-glass-border",
                "text-text-primary placeholder:text-text-muted",
                "focus:outline-none focus:border-accent-purple focus:shadow-[0_0_20px_rgba(139,127,212,0.2)]",
                "transition-all duration-200"
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
            <label className="block text-sm text-text-secondary mb-2">
              생년월일 <span className="text-accent-purple">*</span>
            </label>
            <div className="mb-2 flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, calendarType: "solar" })}
                className={cn(
                  "flex-1 h-[32px] rounded-full text-xs transition-all duration-200 border",
                  formData.calendarType === "solar"
                    ? "bg-accent-purple/15 border-accent-purple text-text-primary"
                    : "bg-secondary/50 border-glass-border text-text-secondary hover:border-glass-highlight"
                )}
              >
                양력
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, calendarType: "lunar" })}
                className={cn(
                  "flex-1 h-[32px] rounded-full text-xs transition-all duration-200 border",
                  formData.calendarType === "lunar"
                    ? "bg-accent-purple/15 border-accent-purple text-text-primary"
                    : "bg-secondary/50 border-glass-border text-text-secondary hover:border-glass-highlight"
                )}
              >
                음력
              </button>
            </div>
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
              <select
                value={formData.birthTime}
                onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                className={cn(
                  "w-full h-[52px] px-4 rounded-xl",
                  "bg-secondary border border-glass-border",
                  "text-text-primary placeholder:text-text-muted",
                  "focus:outline-none focus:border-accent-purple focus:shadow-[0_0_20px_rgba(139,127,212,0.2)]",
                  "transition-all duration-200"
                )}
              >
                {birthTimeOptions.map((opt) => (
                  <option key={opt.value || "unknown"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-muted mt-2">
                사주앱 방식(자/축/…/해시)으로 선택하면 해당 구간의 대표 시간으로 계산돼요.
              </p>
            </div>
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
        <div className="grid grid-cols-2 gap-2">
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
          표현 스타일
        </h2>
        <p className="text-xs text-text-muted mb-3">
          해석을 어떤 말투로 보여줄지 선택하세요. 결과 화면에서는 바꿀 수 없어요.
        </p>
        <div className="flex flex-wrap gap-2">
          {getStylePresets().map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData({ ...formData, toneStyle: opt.value })}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                "border",
                formData.toneStyle === opt.value
                  ? "bg-accent-purple/20 border-accent-purple/50 text-text-primary"
                  : "bg-secondary/50 border-glass-border text-text-secondary hover:border-glass-highlight hover:text-text-primary"
              )}
            >
              {opt.label}
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
            <span>✦</span> 복합 운세 생성하기
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() =>
          onSubmit({
            name: "홍길동",
            calendarType: "solar",
            birthDate: "1995-03-15",
            birthTime: "14:30",
            birthPlace: "서울",
            interests: ["career_money", "love_relationship"],
            toneStyle: NO_STYLE_KEY,
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
