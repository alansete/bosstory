"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type AvailableChar = {
  id: string;
  name: string;
  className: string;
  level: number;
  world: string;
  ownerName: string;
  imageUrl: string | null;
};

export function AddMemberSelect({
  partyId,
  availableCharacters,
}: {
  partyId: string;
  availableCharacters: AvailableChar[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedChar = availableCharacters.find((c) => c.id === selected);

  async function handleAdd() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${partyId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: selected }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      toast.success("Member added!");
      setSelected("");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add member"
      );
    } finally {
      setLoading(false);
    }
  }

  if (availableCharacters.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No characters available to add.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Select value={selected} onValueChange={(v) => setSelected(v ?? "")}>
        <SelectTrigger className="text-sm">
          <SelectValue placeholder="Select character..." />
        </SelectTrigger>
        <SelectContent>
          {availableCharacters.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              Lv.{c.level} {c.name} ({c.className})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Preview */}
      {selectedChar && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          {selectedChar.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedChar.imageUrl}
              alt={selectedChar.name}
              className="w-10 h-10 object-contain"
            />
          )}
          <div className="text-xs">
            <p className="font-semibold">{selectedChar.name}</p>
            <p className="text-muted-foreground">
              {selectedChar.className} &middot; {selectedChar.ownerName}
            </p>
          </div>
        </div>
      )}

      <Button
        onClick={handleAdd}
        disabled={!selected || loading}
        className="w-full"
        size="sm"
      >
        {loading ? "Adding..." : "Add to Party"}
      </Button>
    </div>
  );
}
