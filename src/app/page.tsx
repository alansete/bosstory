import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { BossCard } from "@/components/boss-card";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl sm:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            BossStory
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Organize your MapleStory boss parties with friends. Add your
          characters, create parties, and schedule your weekly runs.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/bosses">
            <Button size="lg">Browse Bosses</Button>
          </Link>
          <Link href="/characters/all">
            <Button variant="outline" size="lg">View Characters</Button>
          </Link>
        </div>
      </div>

      {/* Boss Grid */}
      <h2 className="text-2xl font-bold mb-6">Available Bosses</h2>
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
