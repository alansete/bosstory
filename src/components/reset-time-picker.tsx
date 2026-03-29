"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// MapleStory weekly boss reset: Thursday 00:00 UTC
function getNextResetUTC(): Date {
  const now = new Date();
  const utcDay = now.getUTCDay(); // 0=Sun, 4=Thu
  const utcHour = now.getUTCHours();
  let daysUntilThursday = (4 - utcDay + 7) % 7;
  // If it's Thursday but past midnight UTC, next week
  if (daysUntilThursday === 0 && utcHour >= 0) {
    // If it's currently Thursday, check if reset already happened
    // Reset is at 00:00 UTC Thursday, so if we're past that, next week
    if (utcHour > 0 || now.getUTCMinutes() > 0) {
      daysUntilThursday = 7;
    }
  }
  const reset = new Date(now);
  reset.setUTCDate(now.getUTCDate() + daysUntilThursday);
  reset.setUTCHours(0, 0, 0, 0);
  return reset;
}

function formatUTC(date: Date): string {
  return date.toUTCString().replace("GMT", "UTC");
}

function formatLocal(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatResetRelative(date: Date): string {
  const reset = getNextResetUTC();
  const diffMs = date.getTime() - reset.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours === 0) return "Reset";
  return diffHours > 0 ? `Reset +${diffHours}h` : `Reset ${diffHours}h`;
}

const PRESETS = [
  { label: "Reset -2h", offset: -2 },
  { label: "Reset -1h", offset: -1 },
  { label: "Reset", offset: 0 },
  { label: "Reset +1h", offset: 1 },
  { label: "Reset +2h", offset: 2 },
  { label: "Reset +3h", offset: 3 },
];

export function ResetTimePicker({
  partyId,
  currentSchedule,
  canSchedule,
}: {
  partyId: string;
  currentSchedule: string | null;
  canSchedule: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [customDate, setCustomDate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const nextReset = useMemo(() => getNextResetUTC(), []);

  function selectPreset(offsetHours: number) {
    const date = new Date(nextReset.getTime() + offsetHours * 60 * 60 * 1000);
    setSelectedDate(date);
  }

  function selectCustom() {
    if (!customDate) return;
    setSelectedDate(new Date(customDate));
  }

  async function handleSchedule() {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledDate: selectedDate.toISOString() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      toast.success("Run scheduled!");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to schedule"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!canSchedule) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-heading font-semibold text-sm">Schedule Run</h3>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setMode("preset")}
            className={`text-xs px-2 py-1 rounded ${mode === "preset" ? "bg-purple-500/20 text-purple-300" : "text-muted-foreground hover:text-foreground"}`}
          >
            Reset Timing
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`text-xs px-2 py-1 rounded ${mode === "custom" ? "bg-purple-500/20 text-purple-300" : "text-muted-foreground hover:text-foreground"}`}
          >
            Custom
          </button>
        </div>
      </div>

      {mode === "preset" ? (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Next reset: {formatLocal(nextReset)}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map((p) => {
              const presetDate = new Date(
                nextReset.getTime() + p.offset * 60 * 60 * 1000
              );
              const isSelected =
                selectedDate?.getTime() === presetDate.getTime();
              return (
                <button
                  key={p.label}
                  onClick={() => selectPreset(p.offset)}
                  className={`text-xs py-2 px-2 rounded-lg border transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-500/20 text-purple-300"
                      : "border-border hover:border-purple-500/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-xs">Pick date & time</Label>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="text-sm h-9"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={selectCustom}
              disabled={!customDate}
            >
              Set
            </Button>
          </div>
        </div>
      )}

      {/* Time preview */}
      {selectedDate && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Reset</span>
            <span className="font-mono text-purple-300">
              {formatResetRelative(selectedDate)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">UTC</span>
            <span className="font-mono">{formatUTC(selectedDate)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Local</span>
            <span className="font-mono">{formatLocal(selectedDate)}</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleSchedule}
        disabled={!selectedDate || loading}
        className="w-full"
      >
        {loading ? "Scheduling..." : "Confirm Schedule"}
      </Button>
    </div>
  );
}
