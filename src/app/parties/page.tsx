import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreatePartyDialog } from "@/components/create-party-dialog";
import { ScheduleInline } from "@/components/schedule-inline";

export default async function MyPartiesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Get all characters belonging to the user
  const userCharIds = (
    await prisma.character.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })
  ).map((c) => c.id);

  // Find all parties where user's characters are members OR user is creator
  const parties = await prisma.party.findMany({
    where: {
      OR: [
        { creatorId: session.user.id },
        { members: { some: { characterId: { in: userCharIds } } } },
      ],
    },
    include: {
      boss: true,
      creator: true,
      members: {
        include: {
          character: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const bosses = await prisma.boss.findMany();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Parties</h1>
        <CreatePartyDialog
          bosses={bosses.map((b) => ({
            id: b.id,
            name: b.name,
            difficulty: b.difficulty,
          }))}
        />
      </div>

      {parties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            You&apos;re not in any parties yet. Create one or get added to one!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {parties.map((party) => {
            const isCreator = party.creatorId === session.user!.id;
            return (
              <Card
                key={party.id}
                className="overflow-hidden hover:border-purple-500/50 transition-all"
              >
                <div className="flex">
                  {/* Boss image sidebar */}
                  <div className="relative w-24 sm:w-32 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={party.boss.imageUrl}
                      alt={party.boss.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link
                          href={`/parties/${party.id}`}
                          className="font-bold text-lg hover:text-purple-400 transition-colors"
                        >
                          {party.boss.name}
                        </Link>
                        <div className="flex gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {party.boss.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {party.members.length}/6 members
                          </Badge>
                          {isCreator && (
                            <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                              Creator
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Members */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {party.members.map((m) => (
                        <span
                          key={m.id}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          Lv.{m.character.level} {m.character.name}
                        </span>
                      ))}
                    </div>

                    {/* Schedule */}
                    <ScheduleInline
                      partyId={party.id}
                      isCreator={isCreator}
                      currentSchedule={
                        party.scheduledDate?.toISOString() || null
                      }
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
