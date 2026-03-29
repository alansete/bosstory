"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      toast.success(`${characterName} removed from party`);
      router.refresh();
    } catch {
      toast.error("Failed to kick member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleKick}
      disabled={loading}
      className="text-xs text-destructive/70 hover:text-destructive opacity-0 group-hover/member:opacity-100 transition-opacity"
    >
      {loading ? "..." : "Kick"}
    </Button>
  );
}
