"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

  if (!isCreator) {
    return (
      <p className="text-sm text-muted-foreground">
        {displayDate ? `Scheduled: ${displayDate}` : "No date set"}
      </p>
    );
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

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {displayDate ? `Scheduled: ${displayDate}` : "Click to set schedule"}{" "}
      <span className="text-xs opacity-50">(edit)</span>
    </button>
  );
}
