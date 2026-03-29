import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Boss } from "@prisma/client";

const difficultyColors: Record<string, string> = {
  Normal: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Hard: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Chaos: "bg-red-500/10 text-red-400 border-red-500/20",
  Extreme: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

export function BossCard({
  boss,
  activeParties,
}: {
  boss: Boss;
  activeParties: number;
}) {
  return (
    <Link href={`/bosses/${boss.id}`}>
      <div className="group relative overflow-hidden rounded-lg border border-border bg-card hover:border-zinc-600 transition-all duration-200 active:scale-[0.98] active:-translate-y-[1px]">
        <div className="relative h-44 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={boss.imageUrl}
            alt={boss.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <h3 className="text-base font-semibold tracking-tight text-white">
              {boss.name}
            </h3>
            <Badge
              variant="outline"
              className={difficultyColors[boss.difficulty] || ""}
            >
              {boss.difficulty}
            </Badge>
          </div>
        </div>
        <div className="px-3 py-2.5 flex justify-between items-center text-xs text-zinc-500">
          <span>Max {boss.maxPartySize}</span>
          <span className="font-mono">
            {activeParties} {activeParties === 1 ? "party" : "parties"}
          </span>
        </div>
      </div>
    </Link>
  );
}
