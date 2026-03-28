"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DeleteCharacterButton({
  characterId,
  characterName,
}: {
  characterId: string;
  characterName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${characterName}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/characters/${characterId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success(`${characterName} deleted`);
      router.refresh();
    } catch {
      toast.error("Failed to delete character");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive"
    >
      {loading ? "..." : "Delete"}
    </Button>
  );
}
