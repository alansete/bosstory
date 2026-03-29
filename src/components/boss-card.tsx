import Link from "next/link";
import type { Boss } from "@prisma/client";

const DifficultyDot: Record<string, string> = {
  Normal: "bg-emerald-500",
  Hard: "bg-amber-500",
  Chaos: "bg-red-500",
  Extreme: "bg-rose-400",
};

export function BossCard({
  boss,
  activeParties,
}: {
  boss: Boss;
  activeParties: number;
}) {
  return (
    <Link
      href={`/bosses/${boss.id}`}
      className="group block rounded-lg overflow-hidden border border-border hover:border-foreground/15 transition-all duration-150 active:scale-[0.98]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={boss.imageUrl}
          alt={boss.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`size-1.5 rounded-full shrink-0 ${DifficultyDot[boss.difficulty] || "bg-zinc-500"}`}
          />
          <span className="text-sm font-medium truncate">{boss.name}</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground shrink-0 ml-2">
          {activeParties}
        </span>
      </div>
    </Link>
  );
}
