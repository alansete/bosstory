import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { BossCard } from "@/components/boss-card";
import { Sword, Users } from "@phosphor-icons/react/dist/ssr";

export default async function Home() {
  const bosses = await prisma.boss.findMany({
    include: {
      parties: {
        where: { status: "open" },
        include: { members: true },
      },
    },
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero - Left aligned, split layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-16 md:py-24 items-center">
        <div>
          <p className="text-sm font-mono text-emerald-400 tracking-wider uppercase mb-4">
            Boss Party Organizer
          </p>
          <h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold mb-6">
            Organize your
            <br />
            weekly runs.
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed max-w-[50ch] mb-8">
            Add your characters, assemble parties, and coordinate boss runs
            with your guild. Built for MapleStory endgame.
          </p>
          <div className="flex gap-3">
            <Link href="/bosses">
              <Button
                size="lg"
                className="active:scale-[0.98] active:-translate-y-[1px] transition-transform"
              >
                <Sword weight="bold" className="size-4 mr-2" />
                Browse Bosses
              </Button>
            </Link>
            <Link href="/characters/all">
              <Button
                variant="outline"
                size="lg"
                className="active:scale-[0.98] active:-translate-y-[1px] transition-transform"
              >
                <Users weight="bold" className="size-4 mr-2" />
                View Roster
              </Button>
            </Link>
          </div>
        </div>
        <div className="hidden md:block relative">
          <div className="grid grid-cols-2 gap-3 opacity-70">
            {bosses.slice(0, 4).map((boss) => (
              <div
                key={boss.id}
                className="aspect-[4/3] rounded-lg overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={boss.imageUrl}
                  alt={boss.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Boss Grid */}
      <div className="border-t border-border pt-12 pb-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl tracking-tight font-semibold">
            Available Bosses
          </h2>
          <span className="text-sm font-mono text-zinc-500">
            {bosses.length} bosses
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bosses.map((boss) => (
            <BossCard
              key={boss.id}
              boss={boss}
              activeParties={boss.parties.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
