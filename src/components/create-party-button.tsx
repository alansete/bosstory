"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CreatePartyButton({
  bossId,
  bossName,
}: {
  bossId: string;
  bossName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bossId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create party");
      }
      const party = await res.json();
      toast.success(`Party created for ${bossName}!`);
      router.push(`/parties/${party.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create party");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleCreate} disabled={loading} className="w-fit">
      {loading ? "Creating..." : "Create Party"}
    </Button>
  );
}
