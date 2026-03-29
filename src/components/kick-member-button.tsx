"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "@phosphor-icons/react";

export function KickMemberButton({
  partyId,
  memberId,
  characterName,
}: {
  partyId: string;
  memberId: string;
  characterName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleKick() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/parties/${partyId}/members/${memberId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed");
      toast.success(`${characterName} removed`);
      router.refresh();
    } catch {
      toast.error("Failed to kick member");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <p className="text-xs text-white/70 text-center">
          Remove <span className="font-semibold text-white">{characterName}</span>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleKick}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-md bg-red-500/80 text-white hover:bg-red-500 transition-colors active:scale-95"
          >
            {loading ? "..." : "Remove"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs px-3 py-1.5 rounded-md bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="absolute top-2 right-2 size-6 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center text-white/30 hover:text-red-400 transition-colors active:scale-90"
      title={`Remove ${characterName}`}
    >
      <X weight="bold" className="size-3" />
    </button>
  );
}
