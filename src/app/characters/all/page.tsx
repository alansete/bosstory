import { prisma } from "@/lib/prisma";
import { CharacterRosterGrid } from "@/components/character-roster-grid";

export default async function AllCharactersPage() {
  const characters = await prisma.character.findMany({
    include: {
      user: true,
      partyMembers: {
        include: {
          party: {
            include: { boss: true },
          },
        },
      },
    },
    orderBy: { level: "desc" },
  });

  const mapped = characters.map((c) => ({
    id: c.id,
    name: c.name,
    className: c.className,
    level: c.level,
    world: c.world,
    imageUrl: c.imageUrl,
    ownerName: c.user.name || "Unknown",
    parties: c.partyMembers.map((pm) => ({
      id: pm.party.id,
      bossName: pm.party.boss.name,
      bossImage: pm.party.boss.imageUrl,
    })),
  }));

  // Extract unique classes for filter
  const classes = Array.from(new Set(characters.map((c) => c.className))).sort();

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-3xl tracking-tighter font-bold">
          All Characters
        </h1>
        <span className="text-sm font-mono text-zinc-500">
          {characters.length} registered
        </span>
      </div>

      <CharacterRosterGrid characters={mapped} classes={classes} />
    </div>
  );
}
