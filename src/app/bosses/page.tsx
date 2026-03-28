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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Bosses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bosses.map((boss) => (
          <BossCard
            key={boss.id}
            boss={boss}
            activeParties={boss.parties.length}
          />
        ))}
      </div>
    </div>
  );
}
