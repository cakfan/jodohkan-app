"use client";

import { CheckCircle, Target, Video, HeartHandshake, Sparkles } from "lucide-react";

const PHASES = [
  { key: "chat", label: "Ta'aruf", icon: Target },
  { key: "nadzor", label: "Nadzor", icon: Video },
  { key: "khitbah", label: "Khitbah", icon: HeartHandshake },
  { key: "completed", label: "Selesai", icon: Sparkles },
] as const;

export function TaarufTimeline({
  currentPhase,
}: {
  currentPhase: "chat" | "nadzor" | "khitbah" | "completed";
}) {
  const currentIndex = PHASES.findIndex((p) => p.key === currentPhase);

  return (
    <div className="flex items-center gap-1 px-2 py-2">
      {PHASES.map((phase, idx) => {
        const Icon = phase.icon;
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <div key={phase.key} className="flex flex-1 items-center gap-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex size-7 items-center justify-center rounded-full transition-colors ${
                  isCompleted
                    ? "bg-emerald-500/10 text-emerald-600"
                    : isCurrent
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground/40"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>
              <span
                className={`text-[9px] font-medium leading-tight ${
                  isCompleted
                    ? "text-emerald-600"
                    : isCurrent
                      ? "text-primary font-semibold"
                      : "text-muted-foreground/40"
                }`}
              >
                {phase.label}
              </span>
            </div>
            {idx < PHASES.length - 1 && (
              <div
                className={`mx-1 h-px flex-1 self-start mt-3.5 ${
                  idx < currentIndex ? "bg-emerald-400" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
