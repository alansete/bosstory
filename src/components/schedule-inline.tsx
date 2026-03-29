"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Timer } from "@phosphor-icons/react";

function useCountdown(target: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target) return null;
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return "now";

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ScheduleInline({
  partyId,
  isCreator,
  currentSchedule,
}: {
  partyId: string;
  isCreator: boolean;
  currentSchedule: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(
    currentSchedule ? currentSchedule.slice(0, 16) : ""
  );
  const [loading, setLoading] = useState(false);
  const countdown = useCountdown(currentSchedule);

  const displayDate = currentSchedule
    ? new Date(currentSchedule).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  async function handleSave() {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: new Date(date).toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Schedule updated!");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Failed to update schedule");
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-8 text-sm w-auto"
        />
        <Button size="sm" onClick={handleSave} disabled={loading}>
          {loading ? "..." : "Save"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditing(false)}
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (!displayDate) {
    return isCreator ? (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        Set schedule
      </button>
    ) : (
      <p className="text-xs text-zinc-600">No date set</p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400">{displayDate}</span>
      {countdown && (
        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
          <Timer weight="bold" className="size-3" />
          {countdown === "now" ? "Now!" : countdown}
        </span>
      )}
      {isCreator && (
        <button
          onClick={() => setEditing(true)}
          className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          edit
        </button>
      )}
    </div>
  );
}
