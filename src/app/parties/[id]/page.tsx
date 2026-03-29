import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetTimePicker } from "@/components/reset-time-picker";
import { KickMemberButton } from "@/components/kick-member-button";
import { CompleteRunButton } from "@/components/complete-run-button";
import { AddMemberSelect } from "@/components/add-member-select";
import { CheckCircle, Clock, Info } from "@phosphor-icons/react/dist/ssr";

function formatResetRelative(date: Date): string {
  const d = new Date(date);
  const utcDay = d.getUTCDay();
  const reset = new Date(d);
  reset.setUTCDate(d.getUTCDate() - ((utcDay + 3) % 7));
  reset.setUTCHours(0, 0, 0, 0);
  const diffMs = date.getTime() - reset.getTime();
  const diffH = Math.round(diffMs / 3600000);
  if (diffH === 0) return "Reset";
  return diffH > 0 ? `Reset +${diffH}h` : `Reset ${diffH}h`;
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
      members: {
        include: {
          character: {
            include: { user: true },
          },
        },
      },
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
        where: {
          id: {
            notIn: memberCharIds.length > 0 ? memberCharIds : ["_none_"],
          },
        },
        include: { user: true },
      })
    : [];

  return (
    <div className="relative min-h-[calc(100dvh-3.5rem)]">
      {/* Boss Background */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={party.boss.imageUrl}
          alt={party.boss.name}
          className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/85 to-background" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-zinc-400 border-zinc-700">
              {party.boss.difficulty}
            </Badge>
            {hasActiveRun && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Clock weight="bold" className="size-3 mr-1" />
                Scheduled
              </Badge>
            )}
            {isCompleted && (
              <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-600">
                <CheckCircle weight="bold" className="size-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl tracking-tighter font-bold leading-none">
            {party.boss.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Created by {party.creator.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Members */}
          <div className="lg:col-span-2 space-y-6">
            {/* Schedule banner */}
            {party.scheduledDate && (
              <div
                className={`rounded-lg p-4 border ${hasActiveRun ? "border-emerald-500/20 bg-emerald-500/5" : "border-zinc-700 bg-zinc-800/30"}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                      {hasActiveRun ? "Next Run" : "Last Run"}
                    </p>
                    <p className="font-semibold tracking-tight text-lg">
                      {new Date(party.scheduledDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs font-mono text-zinc-500">
                      <span>
                        {formatResetRelative(new Date(party.scheduledDate))}
                      </span>
                      <span>
                        {new Date(party.scheduledDate)
                          .toUTCString()
                          .replace("GMT", "UTC")}
                      </span>
                    </div>
                  </div>
                  {isCreator && hasActiveRun && (
                    <CompleteRunButton partyId={party.id} />
                  )}
                </div>
              </div>
            )}

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">
                  Party Members
                </h2>
                <span className="text-sm font-mono text-zinc-500">
                  {party.members.length}/{party.boss.maxPartySize}
                </span>
              </div>

              {party.members.length === 0 ? (
                <div className="py-16 border border-dashed border-zinc-700 rounded-lg text-center">
                  <p className="text-sm text-zinc-500">
                    No members yet. Add characters to get started.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {party.members.map((member) => (
                    <div
                      key={member.id}
                      className="group/member flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-border hover:border-zinc-600 transition-all duration-200"
                    >
                      <div className="relative size-12 shrink-0 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                        {member.character.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.character.imageUrl}
                            alt={member.character.name}
                            className="h-10 object-contain"
                          />
                        ) : (
                          <span className="text-sm font-bold font-mono text-zinc-400">
                            {member.character.level}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm tracking-tight truncate">
                          {member.character.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Lv.{member.character.level}{" "}
                          {member.character.className}
                        </p>
                        <p className="text-[10px] text-zinc-600">
                          {member.character.world} / {member.character.user.name}
                        </p>
                      </div>
                      {isCreator && (
                        <KickMemberButton
                          partyId={party.id}
                          memberId={member.id}
                          characterName={member.character.name}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {session?.user && !isFull && (
              <Card className="border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm tracking-tight">
                    Add Member
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AddMemberSelect
                    partyId={party.id}
                    availableCharacters={availableCharacters.map((c) => ({
                      id: c.id,
                      name: c.name,
                      className: c.className,
                      level: c.level,
                      world: c.world,
                      ownerName: c.user.name || "Unknown",
                      imageUrl: c.imageUrl,
                    }))}
                  />
                </CardContent>
              </Card>
            )}

            {isCreator && (
              <Card className="border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm tracking-tight">
                    {canSchedule ? "Schedule Run" : "Run Active"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasActiveRun ? (
                    <p className="text-sm text-zinc-500">
                      Complete the current run before scheduling a new one.
                    </p>
                  ) : (
                    <ResetTimePicker
                      partyId={party.id}
                      currentSchedule={
                        party.scheduledDate?.toISOString() || null
                      }
                      canSchedule={canSchedule}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm tracking-tight flex items-center gap-1.5">
                  <Info weight="bold" className="size-3.5" />
                  Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Boss</span>
                  <Link
                    href={`/bosses/${party.boss.id}`}
                    className="text-zinc-300 hover:text-emerald-400 transition-colors"
                  >
                    {party.boss.name}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Max Size</span>
                  <span className="font-mono">{party.boss.maxPartySize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Created</span>
                  <span className="font-mono text-xs">
                    {new Date(party.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
