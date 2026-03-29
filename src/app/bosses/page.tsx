import { prisma } from "@/lib/prisma";
import { BossCard } from "@/components/boss-card";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {bosses.map((boss) => (
          <BossCard key={boss.id} boss={boss} activeParties={boss.parties.length} />
        ))}
      </div>
    </div>
  );
}
