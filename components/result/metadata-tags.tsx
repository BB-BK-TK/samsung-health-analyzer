"use client";

import { cn } from "@/lib/utils";
import type { MetadataTagViewModel } from "@/types/result-schema";

interface MetadataTagsProps {
  tags: MetadataTagViewModel[];
  className?: string;
}

export function MetadataTags({ tags, className }: MetadataTagsProps) {
  if (!tags?.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs",
            "bg-secondary/60 text-text-secondary border border-glass-border"
          )}
        >
          <span className="text-text-muted">{tag.label}:</span>
          <span>{tag.value}</span>
        </span>
      ))}
    </div>
  );
}
