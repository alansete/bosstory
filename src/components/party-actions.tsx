"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type AvailableChar = {
  id: string;
  name: string;
  className: string;
  level: number;
  world: string;
  ownerName: string;
};

export function PartyActions({
  partyId,
  isCreator,
  isFull,
  availableCharacters,
  currentSchedule,
}: {
  partyId: string;
  isCreator: boolean;
  isFull: boolean;
  availableCharacters: AvailableChar[];
  currentSchedule: string | null;
}) {
  const router = useRouter();
  const [selectedChar, setSelectedChar] = useState("");
  const [scheduleDate, setScheduleDate] = useState(
    currentSchedule ? currentSchedule.slice(0, 16) : ""
  );
  const [loading, setLoading] = useState(false);

  async function addMember() {
    if (!selectedChar) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${partyId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: selectedChar }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add member");
      }
      toast.success("Member added!");
      setSelectedChar("");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add member"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateSchedule() {
    if (!scheduleDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledDate: new Date(scheduleDate).toISOString() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update schedule");
      }
      toast.success("Schedule updated!");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Add Member */}
      {!isFull && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedChar} onValueChange={(v) => setSelectedChar(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a character..." />
              </SelectTrigger>
              <SelectContent>
                {availableCharacters.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    Lv.{c.level} {c.name} ({c.className}) - {c.ownerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={addMember}
              disabled={!selectedChar || loading}
              className="w-full"
            >
              {loading ? "Adding..." : "Add to Party"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Schedule (Creator only) */}
      {isCreator && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schedule Run</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule">Date & Time</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
            <Button
              onClick={updateSchedule}
              disabled={!scheduleDate || loading}
              className="w-full"
            >
              {loading ? "Updating..." : "Set Schedule"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
