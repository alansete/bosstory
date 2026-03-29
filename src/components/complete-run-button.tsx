"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CompleteRunButton({ partyId }: { partyId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleComplete() {
    if (!confirm("Mark this run as completed?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completeRun: true }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Run completed! You can now schedule the next one.");
      router.refresh();
    } catch {
      toast.error("Failed to complete run");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleComplete}
      disabled={loading}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? "Completing..." : "Complete Run"}
    </Button>
  );
}
