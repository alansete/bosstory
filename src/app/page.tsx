import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-12 py-16 lg:py-24">
        <div className="lg:col-span-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-bold leading-[0.95]">
            Organize your
            <br />
            boss runs.
          </h1>
          <p className="mt-5 text-muted-foreground leading-relaxed max-w-[52ch]">
            Track your MapleStory characters, assemble parties for endgame
            bosses, and coordinate weekly runs with your guild.
          </p>
          <div className="flex gap-3 mt-8">
            <Link
              href="/bosses"
              className="inline-flex h-9 items-center rounded-md bg-foreground text-background px-4 text-sm font-medium hover:bg-foreground/90 active:scale-[0.97] transition-all"
            >
              Browse bosses
            </Link>
            <Link
              href="/characters/all"
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 active:scale-[0.97] transition-all"
            >
              View roster
            </Link>
          </div>
        </div>
        <div className="hidden lg:grid lg:col-span-2 grid-cols-2 gap-2 self-center">
          {bosses.slice(0, 4).map((b) => (
            <Link
              key={b.id}
              href={`/bosses/${b.id}`}
              className="aspect-square rounded-lg overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
            </Link>
          ))}
        </div>
      </section>

      {/* Bosses */}
      <section className="border-t border-border py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Bosses
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {bosses.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {bosses.map((boss) => (
            <BossCard
              key={boss.id}
              boss={boss}
              activeParties={boss.parties.length}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
