"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "@phosphor-icons/react";

type Props = {
  partyId: string;
  memberId: string;
  name: string;
  level: number;
  className: string;
  world: string;
  ownerName: string;
  imageUrl: string | null;
  isCreator: boolean;
};

export function PartyMemberCard({
  partyId,
  memberId,
  name,
  level,
  className,
  world,
  ownerName,
  imageUrl,
  isCreator,
}: Props) {
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
      toast.success(`${name} removed`);
      router.refresh();
    } catch {
      toast.error("Failed to remove");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="rounded-lg bg-black/60 border border-red-500/20 backdrop-blur-sm p-5 flex flex-col items-center justify-center text-center min-h-[260px]">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-16 object-contain opacity-40 mb-3" />
        )}
        <p className="text-sm text-white/80 mb-4">
          Remove <span className="font-semibold text-white">{name}</span> from the party?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleKick}
            disabled={loading}
            className="text-sm px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-400 transition-colors active:scale-95"
          >
            {loading ? "Removing..." : "Remove"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-sm px-4 py-2 rounded-md bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg bg-black/40 border border-white/8 backdrop-blur-sm p-5 flex flex-col items-center text-center hover:border-white/20 transition-all">
      {/* Avatar */}
      <div className="h-36 sm:h-44 w-full mb-4 flex items-center justify-center">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full object-contain drop-shadow-[0_4px_20px_rgba(255,255,255,0.08)]"
          />
        ) : (
          <div className="size-24 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-3xl font-bold font-mono text-white/60">{level}</span>
          </div>
        )}
      </div>

      <p className="font-semibold text-white text-base tracking-tight truncate w-full">{name}</p>
      <p className="text-sm text-white/50 mt-1">Lv.{level} {className}</p>
      <p className="text-xs text-white/25 mt-0.5">{world} / {ownerName}</p>

      {isCreator && (
        <button
          onClick={() => setConfirming(true)}
          className="absolute top-3 right-3 size-7 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center text-white/30 hover:text-red-400 transition-colors active:scale-90"
          title={`Remove ${name}`}
        >
          <X weight="bold" className="size-3.5" />
        </button>
      )}
    </div>
  );
}
