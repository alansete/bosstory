"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "@phosphor-icons/react";

export function ToggleCompleteButton({
  partyId,
  isCompleted,
}: {
  partyId: string;
  isCompleted: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleComplete: true }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(isCompleted ? "Marked as pending" : "Boss cleared!");
      router.refresh();
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`size-10 rounded-lg border-2 flex items-center justify-center transition-all active:scale-90 ${
        isCompleted
          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
          : "border-white/20 bg-white/5 text-white/20 hover:border-white/40 hover:text-white/40"
      }`}
      title={isCompleted ? "Mark as not done" : "Mark as done"}
    >
      {loading ? (
        <span className="text-xs">...</span>
      ) : (
        <Check weight="bold" className={`size-5 ${isCompleted ? "opacity-100" : "opacity-0"}`} />
      )}
    </button>
  );
}
