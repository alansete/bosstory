"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash } from "@phosphor-icons/react";

export function DeletePartyButton({
  partyId,
  bossName,
}: {
  partyId: string;
  bossName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${partyId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Party deleted");
      router.push("/parties");
    } catch {
      toast.error("Failed to delete party");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20">
        <span className="text-xs text-red-300">Delete {bossName} party?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs px-2 py-0.5 rounded bg-red-500/80 text-white hover:bg-red-500 transition-colors active:scale-95"
        >
          {loading ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/50 hover:bg-white/20 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors active:scale-95"
    >
      <Trash weight="bold" className="size-3.5" />
      Delete party
    </button>
  );
}
