import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    <div>
      {/* Hero - fullscreen cinematic */}
      <section className="relative min-h-[calc(100dvh-3rem)] flex items-end">
        {/* Background collage */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-0">
            {bosses.slice(0, 6).map((b) => (
              <div key={b.id} className="relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.bgUrl || b.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-20 pt-32">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-white">
            Boss
            <br />
            Story
          </h1>
          <p className="mt-6 text-white/50 max-w-md leading-relaxed">
            Organize your MapleStory boss parties. Track characters,
            assemble groups, and coordinate weekly runs.
          </p>
          <div className="flex gap-3 mt-8">
            <Link
              href="/bosses"
              className="inline-flex h-10 items-center rounded-md bg-white text-black px-5 text-sm font-medium hover:bg-white/90 active:scale-[0.97] transition-all"
            >
              Browse bosses
            </Link>
            <Link
              href="/characters/all"
              className="inline-flex h-10 items-center rounded-md border border-white/20 text-white/70 px-5 text-sm font-medium hover:bg-white/10 hover:text-white active:scale-[0.97] transition-all"
            >
              View roster
            </Link>
          </div>
        </div>
      </section>

      {/* Boss grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-xl font-semibold tracking-tight">Bosses</h2>
          <span className="text-xs font-mono text-muted-foreground">{bosses.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bosses.map((boss) => (
            <Link
              key={boss.id}
              href={`/bosses/${boss.id}`}
              className="group relative block aspect-[16/9] rounded-lg overflow-hidden active:scale-[0.98] transition-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={boss.bgUrl || boss.imageUrl}
                alt={boss.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Boss GIF overlay */}
              {boss.gifUrl && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={boss.gifUrl}
                    alt=""
                    className="h-20 object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.9)]"
                  />
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold text-white tracking-tight">
                  {boss.name}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                  <span>{boss.difficulty}</span>
                  <span>
                    {boss.parties.length} {boss.parties.length === 1 ? "party" : "parties"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
