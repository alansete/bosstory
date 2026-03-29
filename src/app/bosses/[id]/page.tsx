import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreatePartyButton } from "@/components/create-party-button";

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
          members: {
            include: {
              character: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!boss) notFound();

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Boss Background */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={boss.imageUrl}
          alt={boss.name}
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Boss Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="relative w-full md:w-80 h-64 rounded-xl overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={boss.imageUrl}
              alt={boss.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-end">
            <Badge
              variant="outline"
              className="w-fit mb-2 text-purple-400 border-purple-500/30"
            >
              {boss.difficulty}
            </Badge>
            <h1 className="text-4xl font-bold mb-2">{boss.name}</h1>
            <p className="text-muted-foreground mb-4">
              Max Party Size: {boss.maxPartySize} members
            </p>
            {session?.user && (
              <CreatePartyButton bossId={boss.id} bossName={boss.name} />
            )}
          </div>
        </div>

        {/* Parties */}
        <h2 className="text-2xl font-bold mb-6">
          Active Parties ({boss.parties.length})
        </h2>
        {boss.parties.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No active parties yet. Be the first to create one!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {boss.parties.map((party) => (
              <Link key={party.id} href={`/parties/${party.id}`}>
                <Card className="hover:border-purple-500/50 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {party.creator.name}&apos;s Party
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {party.scheduledDate
                            ? `Scheduled: ${new Date(party.scheduledDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                            : "No date set"}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {party.members.length}/{boss.maxPartySize}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {party.members.map((member) => (
                        <Badge key={member.id} variant="outline">
                          Lv.{member.character.level}{" "}
                          {member.character.name}
                        </Badge>
                      ))}
                      {party.members.length === 0 && (
                        <span className="text-sm text-muted-foreground">
                          No members yet
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
