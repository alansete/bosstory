import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartyActions } from "@/components/party-actions";

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

  // Get available characters to add (not already in party)
  const memberCharIds = party.members.map((m) => m.characterId);
  const availableCharacters = session?.user
    ? await prisma.character.findMany({
        where: {
          id: { notIn: memberCharIds.length > 0 ? memberCharIds : ["_none_"] },
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
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Party Header */}
        <div className="mb-8">
          <Badge
            variant="outline"
            className="mb-2 text-purple-400 border-purple-500/30"
          >
            {party.boss.difficulty}
          </Badge>
          <h1 className="text-3xl font-bold mb-1">
            {party.creator.name}&apos;s {party.boss.name} Party
          </h1>
          <p className="text-muted-foreground">
            {party.scheduledDate
              ? `Scheduled: ${new Date(party.scheduledDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
              : "No date scheduled yet"}
          </p>
        </div>

        {/* Party Members */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>
                Party Members ({party.members.length}/
                {party.boss.maxPartySize})
              </span>
              <Badge
                variant={
                  party.members.length >= party.boss.maxPartySize
                    ? "destructive"
                    : "secondary"
                }
              >
                {party.members.length >= party.boss.maxPartySize
                  ? "Full"
                  : "Open"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {party.members.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No members yet. Add characters to this party!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {party.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {member.character.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {member.character.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.character.className} &middot;{" "}
                        {member.character.world} &middot; by{" "}
                        {member.character.user.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {session?.user && (
          <PartyActions
            partyId={party.id}
            isCreator={isCreator}
            isFull={party.members.length >= party.boss.maxPartySize}
            availableCharacters={availableCharacters.map((c) => ({
              id: c.id,
              name: c.name,
              className: c.className,
              level: c.level,
              world: c.world,
              ownerName: c.user.name || "Unknown",
            }))}
            currentSchedule={party.scheduledDate?.toISOString() || null}
          />
        )}
      </div>
    </div>
  );
}
