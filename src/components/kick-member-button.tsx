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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleKick() {
    if (!confirm(`Kick ${characterName} from the party?`)) return;
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
    }
  }

  return (
    <button
      onClick={handleKick}
      disabled={loading}
      className="size-6 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center text-white/30 hover:text-red-400 transition-colors active:scale-90"
      title={`Remove ${characterName}`}
    >
      {loading ? (
        <span className="text-[10px]">...</span>
      ) : (
        <X weight="bold" className="size-3" />
      )}
    </button>
  );
}
