import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ResetTimePicker } from "@/components/reset-time-picker";
import { PartyMemberCard } from "@/components/party-member-card";
import { CompleteRunButton } from "@/components/complete-run-button";
import { AddMemberSelect } from "@/components/add-member-select";
import { ScheduleBanner } from "@/components/schedule-banner";
import { DeletePartyButton } from "@/components/delete-party-button";

export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const party = await prisma.party.findUnique({
    where: { id },
    include: {
      boss: true,
      creator: true,
      members: { include: { character: { include: { user: true } } } },
    },
  });
  if (!party) notFound();

  const isCreator = session?.user?.id === party.creatorId;
  const isFull = party.members.length >= party.boss.maxPartySize;
  const hasActiveRun = !!party.scheduledDate && !party.completedAt;
  const isCompleted = !!party.completedAt;
  const canSchedule = isCreator && (!party.scheduledDate || isCompleted);

  const memberCharIds = party.members.map((m) => m.characterId);
  const availableCharacters = session?.user
    ? await prisma.character.findMany({
        where: { id: { notIn: memberCharIds.length > 0 ? memberCharIds : ["_"] } },
        include: { user: true },
      })
    : [];

  const bgUrl = party.boss.bgUrl || party.boss.imageUrl;
  const gifUrl = party.boss.gifUrl || party.boss.imageUrl;

  return (
    <div className="relative min-h-[calc(100dvh-3rem)] flex flex-col">
      {/* Fullscreen boss background */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <Link
              href="/parties"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              &larr; Back to parties
            </Link>
            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-white leading-none">
                {party.boss.name}
              </h1>
              <span className={`text-sm font-semibold ${party.boss.difficulty === "Extreme" ? "text-rose-300" : party.boss.difficulty === "Chaos" ? "text-red-400" : party.boss.difficulty === "Hard" ? "text-amber-400" : "text-emerald-400"}`}>
                {party.boss.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-white/40">
                by {party.creator.name}
              </p>
              {isCreator && (
                <DeletePartyButton partyId={party.id} bossName={party.boss.name} />
              )}
            </div>
          </div>

          {/* Boss GIF */}
          <div className="hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gifUrl}
              alt={party.boss.name}
              className="h-32 lg:h-44 object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>

        {/* Schedule banner */}
        {party.scheduledDate && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <ScheduleBanner
                scheduledDate={party.scheduledDate.toISOString()}
                isActive={hasActiveRun}
              />
              {isCreator && hasActiveRun && (
                <CompleteRunButton partyId={party.id} />
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Party members - takes 2 cols */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-widest">
                Party
              </h2>
              <span className="text-sm font-mono text-white/30">
                {party.members.length}/{party.boss.maxPartySize}
              </span>
            </div>

            {party.members.length === 0 ? (
              <div className="py-20 border border-dashed border-white/10 rounded-lg text-center">
                <p className="text-sm text-white/30">No members yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {party.members.map((m) => (
                  <PartyMemberCard
                    key={m.id}
                    partyId={party.id}
                    memberId={m.id}
                    name={m.character.name}
                    level={m.character.level}
                    className={m.character.className}
                    world={m.character.world}
                    ownerName={m.character.user.name || "?"}
                    imageUrl={m.character.imageUrl}
                    isCreator={isCreator}
                  />
                ))}

                {/* Empty slots */}
                {Array.from({ length: party.boss.maxPartySize - party.members.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="rounded-lg border border-dashed border-white/8 p-5 flex flex-col items-center justify-center min-h-[260px]"
                  >
                    <div className="size-12 rounded-full border border-dashed border-white/10 flex items-center justify-center mb-2">
                      <span className="text-white/15 text-lg">+</span>
                    </div>
                    <span className="text-[11px] text-white/15">Empty slot</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add member */}
            {session?.user && !isFull && (
              <div className="rounded-lg bg-black/40 border border-white/8 backdrop-blur-sm p-4">
                <h3 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">
                  Add member
                </h3>
                <AddMemberSelect
                  partyId={party.id}
                  availableCharacters={availableCharacters.map((c) => ({
                    id: c.id,
                    name: c.name,
                    className: c.className,
                    level: c.level,
                    world: c.world,
                    ownerName: c.user.name || "?",
                    imageUrl: c.imageUrl,
                  }))}
                />
              </div>
            )}

            {/* Schedule */}
            {isCreator && (
              <div className="rounded-lg bg-black/40 border border-white/8 backdrop-blur-sm p-4">
                <h3 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">
                  Schedule
                </h3>
                {hasActiveRun ? (
                  <p className="text-sm text-white/30">
                    Complete the current run first.
                  </p>
                ) : (
                  <ResetTimePicker
                    partyId={party.id}
                    currentSchedule={party.scheduledDate?.toISOString() || null}
                    canSchedule={canSchedule}
                  />
                )}
              </div>
            )}

            {/* Info */}
            <div className="rounded-lg bg-black/40 border border-white/8 backdrop-blur-sm p-4">
              <h3 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">
                Details
              </h3>
              <dl className="text-sm space-y-2">
                <div className="flex justify-between">
                  <dt className="text-white/30">Boss</dt>
                  <dd className="text-white/70">
                    <Link href={`/bosses/${party.boss.id}`} className="hover:text-white transition-colors">
                      {party.boss.name}
                    </Link>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/30">Slots</dt>
                  <dd className="font-mono text-white/70">{party.boss.maxPartySize}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/30">Created</dt>
                  <dd className="font-mono text-xs text-white/70">
                    {new Date(party.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
