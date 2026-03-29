"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ResetTimePicker({
  partyId,
  canSchedule,
}: {
  partyId: string;
  currentSchedule: string | null;
  canSchedule: boolean;
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  if (!canSchedule) return null;

  async function handleSchedule() {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledDate: new Date(date).toISOString() }),
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

  return (
    <div className="space-y-3">
      <Input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="text-sm"
      />
      <Button
        onClick={handleSchedule}
        disabled={!date || loading}
        className="w-full active:scale-[0.97] transition-transform"
      >
        {loading ? "Scheduling..." : "Schedule run"}
      </Button>
    </div>
  );
}
