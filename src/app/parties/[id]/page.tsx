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

function formatResetRelative(date: Date): string {
  // Find next Thursday 00:00 UTC from the scheduled date
  const d = new Date(date);
  const utcDay = d.getUTCDay();
  let daysToThursday = (4 - utcDay + 7) % 7;
  if (daysToThursday === 0 && d.getUTCHours() > 0) daysToThursday = 0;
  const reset = new Date(d);
  reset.setUTCDate(d.getUTCDate() - ((utcDay + 3) % 7)); // go back to prev/curr Thursday
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

  // Available characters to add
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
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Boss Background */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={party.boss.imageUrl}
          alt={party.boss.name}
          className="absolute inset-0 w-full h-full object-cover opacity-15 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Badge
              variant="outline"
              className="text-purple-400 border-purple-500/30"
            >
              {party.boss.difficulty}
            </Badge>
            {hasActiveRun && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Run Scheduled
              </Badge>
            )}
            {isCompleted && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Completed
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-heading font-bold mb-1">
            {party.boss.name}
          </h1>
          <p className="text-muted-foreground">
            Created by{" "}
            <span className="text-foreground">{party.creator.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Members */}
          <div className="lg:col-span-2 space-y-6">
            {/* Run schedule banner */}
            {party.scheduledDate && (
              <div
                className={`rounded-xl p-4 border ${hasActiveRun ? "bg-green-500/5 border-green-500/20" : "bg-blue-500/5 border-blue-500/20"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {hasActiveRun ? "Next Run" : "Last Run (Completed)"}
                    </p>
                    <p className="font-heading font-bold text-lg">
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
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>
                        {formatResetRelative(new Date(party.scheduledDate))}
                      </span>
                      <span>
                        UTC:{" "}
                        {new Date(party.scheduledDate)
                          .toUTCString()
                          .replace("GMT", "UTC")}
                      </span>
                    </div>
                  </div>
                  {isCreator && hasActiveRun && (
                    <div className="shrink-0 ml-4">
                      <CompleteRunButton partyId={party.id} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Party Members */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-xl">
                  Party Members
                </h2>
                <Badge
                  variant={isFull ? "destructive" : "secondary"}
                  className="font-heading"
                >
                  {party.members.length}/{party.boss.maxPartySize}
                </Badge>
              </div>

              {party.members.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground">
                    No members yet. Add characters to get started!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {party.members.map((member) => (
                    <div
                      key={member.id}
                      className="group/member relative flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-purple-500/30 transition-all"
                    >
                      {/* Avatar */}
                      <div className="relative w-14 h-14 shrink-0 rounded-lg bg-gradient-to-br from-purple-900/40 to-indigo-900/40 flex items-center justify-center overflow-hidden">
                        {member.character.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.character.imageUrl}
                            alt={member.character.name}
                            className="h-12 object-contain"
                          />
                        ) : (
                          <span className="text-lg font-bold text-purple-300">
                            {member.character.level}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold truncate">
                          {member.character.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Lv.{member.character.level}{" "}
                          {member.character.className}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60">
                          {member.character.world} &middot;{" "}
                          {member.character.user.name}
                        </p>
                      </div>

                      {/* Kick button */}
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

          {/* Right: Actions sidebar */}
          <div className="space-y-6">
            {/* Add Member */}
            {session?.user && !isFull && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-heading">
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

            {/* Schedule */}
            {isCreator && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-heading">
                    {canSchedule ? "Schedule Run" : "Run Scheduled"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasActiveRun ? (
                    <p className="text-sm text-muted-foreground">
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

            {/* Party info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading">Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Boss</span>
                  <Link
                    href={`/bosses/${party.boss.id}`}
                    className="hover:text-purple-400 transition-colors"
                  >
                    {party.boss.name}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Size</span>
                  <span>{party.boss.maxPartySize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>
                    {new Date(party.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
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
