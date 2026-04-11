"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type BossOption = {
  id: string;
  name: string;
  difficulty: string;
};

export function CreatePartyDialog({ bosses }: { bosses: BossOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!selectedBoss) {
      toast.error("Select a boss");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bossId: selectedBoss }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create party");
      }
      const party = await res.json();
      toast.success("Party created!");
      setOpen(false);
      setSelectedBoss("");
      router.push(`/parties/${party.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create party"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 px-2.5 hover:bg-primary/80 transition-colors active:scale-[0.97]">
        Create Party
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Boss Party</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Boss</Label>
            <Select
              value={selectedBoss}
              onValueChange={(v) => setSelectedBoss(v ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a boss..." />
              </SelectTrigger>
              <SelectContent>
                {bosses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} ({b.difficulty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreate}
            disabled={!selectedBoss || loading}
            className="w-full active:scale-[0.97]"
          >
            {loading ? "Creating..." : "Create Party"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
