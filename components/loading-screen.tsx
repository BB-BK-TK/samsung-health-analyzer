"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const loadingMessages = [
  "별자리를 읽고 있습니다.",
  "사주를 분석하고 있습니다.",
  "오행의 조화를 살펴보고 있습니다.",
  "해석을 정리하고 있습니다.",
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <div className="relative mb-6">
        <div
          className={cn(
            "w-16 h-16 rounded-full",
            "bg-gradient-to-r from-accent-purple/20 to-accent-teal/20",
            "animate-pulse"
          )}
          style={{ boxShadow: "0 0 40px rgba(139, 127, 212, 0.2)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl text-text-muted animate-pulse">✦</span>
        </div>
      </div>
      <p
        key={messageIndex}
        className="text-text-muted text-sm animate-in fade-in duration-300"
      >
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
}
