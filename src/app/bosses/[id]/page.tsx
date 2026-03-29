import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CreatePartyButton } from "@/components/create-party-button";
import { getDifficultyColor } from "@/lib/difficulty";

export default async function BossDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const boss = await prisma.boss.findUnique({
    where: { id },
    include: {
      parties: {
        where: { status: "open" },
        include: {
          creator: true,
          members: { include: { character: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!boss) notFound();

  const bgUrl = boss.bgUrl || boss.imageUrl;
  const gifUrl = boss.gifUrl || boss.imageUrl;

  return (
    <div className="relative min-h-[calc(100dvh-3rem)]">
      {/* Fullscreen background */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <Link href="/bosses" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              &larr; All bosses
            </Link>
            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white leading-none">
                {boss.name}
              </h1>
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm text-white/40">
              <span className={`font-semibold ${getDifficultyColor(boss.difficulty)}`}>{boss.difficulty}</span>
              <span className="text-white/15">|</span>
              <span>Max {boss.maxPartySize} players</span>
              <span className="text-white/15">|</span>
              <span>{boss.parties.length} active {boss.parties.length === 1 ? "party" : "parties"}</span>
            </div>
            {session?.user && (
              <div className="mt-5">
                <CreatePartyButton bossId={boss.id} bossName={boss.name} />
              </div>
            )}
          </div>
          <div className="hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gifUrl}
              alt={boss.name}
              className="h-40 lg:h-56 object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] mix-blend-multiply"
            />
          </div>
        </div>

        {/* Parties */}
        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-widest mb-4">
            Active parties
          </h2>
          {boss.parties.length === 0 ? (
            <div className="py-16 border border-dashed border-white/10 rounded-lg text-center">
              <p className="text-sm text-white/30">No parties yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {boss.parties.map((party) => (
                <Link
                  key={party.id}
                  href={`/parties/${party.id}`}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg bg-black/30 border border-white/8 backdrop-blur-sm hover:bg-black/40 hover:border-white/15 transition-all active:scale-[0.995]"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-white">
                      {party.creator.name}&apos;s party
                    </span>
                    <div className="text-xs text-white/30 mt-0.5">
                      {party.scheduledDate
                        ? new Date(party.scheduledDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "No date set"}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/30">
                    {party.members.length}/{boss.maxPartySize}
                  </span>
                  <div className="hidden sm:flex -space-x-1.5">
                    {party.members.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        className="size-8 rounded-full bg-black/50 border-2 border-black/80 overflow-hidden flex items-center justify-center"
                      >
                        {m.character.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.character.imageUrl} alt="" className="h-7 object-contain" />
                        ) : (
                          <span className="text-[9px] font-mono text-white/40">{m.character.level}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
