import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ResetTimePicker } from "@/components/reset-time-picker";
import { KickMemberButton } from "@/components/kick-member-button";
import { CompleteRunButton } from "@/components/complete-run-button";
import { AddMemberSelect } from "@/components/add-member-select";
import { CountdownTimer } from "@/components/countdown-timer";

function resetLabel(date: Date): string {
  const d = new Date(date);
  const utcDay = d.getUTCDay();
  const reset = new Date(d);
  reset.setUTCDate(d.getUTCDate() - ((utcDay + 3) % 7));
  reset.setUTCHours(0, 0, 0, 0);
  const h = Math.round((date.getTime() - reset.getTime()) / 3600000);
  if (h === 0) return "Reset";
  return h > 0 ? `Reset +${h}h` : `Reset ${h}h`;
}

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-10">
        <div className="size-20 sm:size-24 shrink-0 rounded-lg overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={party.boss.imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>{party.boss.difficulty}</span>
            <span className="text-border">/</span>
            <span>by {party.creator.name}</span>
            {hasActiveRun && (
              <>
                <span className="text-border">/</span>
                <span className="text-foreground">Scheduled</span>
              </>
            )}
            {isCompleted && (
              <>
                <span className="text-border">/</span>
                <span>Completed</span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter leading-none">
            {party.boss.name}
          </h1>

          {/* Schedule info */}
          {party.scheduledDate && (
            <div className="mt-3 text-sm">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                <span>
                  {new Date(party.scheduledDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="font-mono text-xs">
                  {resetLabel(new Date(party.scheduledDate))}
                </span>
                <span className="font-mono text-xs">
                  {new Date(party.scheduledDate).toUTCString().slice(0, -4)} UTC
                </span>
              </div>
              {hasActiveRun && (
                <div className="mt-2">
                  <CountdownTimer targetDate={party.scheduledDate.toISOString()} />
                </div>
              )}
            </div>
          )}
        </div>
        {isCreator && hasActiveRun && (
          <div className="shrink-0">
            <CompleteRunButton partyId={party.id} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Members */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Members
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              {party.members.length}/{party.boss.maxPartySize}
            </span>
          </div>

          {party.members.length === 0 ? (
            <div className="py-16 border border-dashed border-border rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Empty party.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {party.members.map((m) => (
                <div key={m.id} className="group/m flex items-center gap-3 py-3">
                  <div className="size-10 shrink-0 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                    {m.character.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.character.imageUrl} alt="" className="h-9 object-contain" />
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground">{m.character.level}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{m.character.name}</span>
                      <span className="text-xs font-mono text-muted-foreground">Lv.{m.character.level}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {m.character.className} &middot; {m.character.world} &middot; {m.character.user.name}
                    </span>
                  </div>
                  {isCreator && (
                    <KickMemberButton partyId={party.id} memberId={m.id} characterName={m.character.name} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {session?.user && !isFull && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
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

          {isCreator && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Schedule
              </h3>
              {hasActiveRun ? (
                <p className="text-sm text-muted-foreground">
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

          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Details
            </h3>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Boss</dt>
                <dd>
                  <Link href={`/bosses/${party.boss.id}`} className="hover:underline">
                    {party.boss.name}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Slots</dt>
                <dd className="font-mono">{party.boss.maxPartySize}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-mono text-xs">
                  {new Date(party.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
