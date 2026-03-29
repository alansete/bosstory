"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "@phosphor-icons/react";

export function CompleteRunButton({ partyId }: { partyId: string }) {
  const [action, setAction] = useState<null | "complete" | "cancel">(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleComplete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completeRun: true }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Run completed!");
      router.refresh();
    } catch {
      toast.error("Failed to complete run");
    } finally {
      setLoading(false);
      setAction(null);
    }
  }

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledDate: null }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Run cancelled");
      router.refresh();
    } catch {
      toast.error("Failed to cancel run");
    } finally {
      setLoading(false);
      setAction(null);
    }
  }

  if (action === "complete") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20">
        <span className="text-xs text-green-300">Mark as completed?</span>
        <button
          onClick={handleComplete}
          disabled={loading}
          className="text-xs px-2 py-0.5 rounded bg-green-600 text-white hover:bg-green-500 transition-colors active:scale-95"
        >
          {loading ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setAction(null)}
          className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/50 hover:bg-white/20 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  if (action === "cancel") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20">
        <span className="text-xs text-red-300">Cancel this run?</span>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-xs px-2 py-0.5 rounded bg-red-500/80 text-white hover:bg-red-500 transition-colors active:scale-95"
        >
          {loading ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setAction(null)}
          className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/50 hover:bg-white/20 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setAction("complete")}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-green-600/80 text-white hover:bg-green-600 transition-colors active:scale-95"
      >
        <Check weight="bold" className="size-3" />
        Complete
      </button>
      <button
        onClick={() => setAction("cancel")}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white/10 text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-colors active:scale-95"
      >
        <X weight="bold" className="size-3" />
        Cancel run
      </button>
    </div>
  );
}
