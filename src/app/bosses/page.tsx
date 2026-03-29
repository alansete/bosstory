import Link from "next/link";
import { prisma } from "@/lib/prisma";

const diffColor: Record<string, string> = {
  Normal: "text-emerald-400",
  Hard: "text-amber-400",
  Chaos: "text-red-400",
  Extreme: "text-rose-300",
};

export default async function BossesPage() {
  const bosses = await prisma.boss.findMany({
    include: {
      parties: {
        where: { status: "open" },
        include: { members: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Bosses</h1>
        <span className="text-xs font-mono text-muted-foreground">{bosses.length}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {bosses.map((boss) => (
          <Link
            key={boss.id}
            href={`/bosses/${boss.id}`}
            className="group relative block aspect-square rounded-lg overflow-hidden bg-muted active:scale-[0.98] transition-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={boss.bgUrl || boss.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                {boss.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[11px] font-semibold ${diffColor[boss.difficulty] || "text-white/50"}`}>
                  {boss.difficulty}
                </span>
                {boss.parties.length > 0 && (
                  <span className="text-[11px] text-white/30 font-mono">
                    {boss.parties.length} {boss.parties.length === 1 ? "party" : "parties"}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
