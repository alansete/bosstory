import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
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
          members: { include: { character: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!boss) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-10">
        <div className="sm:w-64 aspect-[16/10] rounded-lg overflow-hidden bg-muted shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={boss.imageUrl} alt={boss.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground">{boss.difficulty}</span>
          <h1 className="text-3xl font-bold tracking-tighter mt-1">{boss.name}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Max party size: {boss.maxPartySize}
          </p>
          {session?.user && (
            <div className="mt-4">
              <CreatePartyButton bossId={boss.id} bossName={boss.name} />
            </div>
          )}
        </div>
      </div>

      {/* Parties */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Active parties &middot; {boss.parties.length}
        </h2>

        {boss.parties.length === 0 ? (
          <div className="py-16 border border-dashed border-border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">No active parties.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {boss.parties.map((party) => (
              <Link
                key={party.id}
                href={`/parties/${party.id}`}
                className="flex items-center gap-4 py-3 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">
                    {party.creator.name}&apos;s party
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
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
                <span className="text-xs font-mono text-muted-foreground">
                  {party.members.length}/{boss.maxPartySize}
                </span>
                <div className="hidden sm:flex -space-x-1">
                  {party.members.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      className="size-6 rounded-full bg-muted border-2 border-background overflow-hidden flex items-center justify-center"
                    >
                      {m.character.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.character.imageUrl} alt="" className="h-5 object-contain" />
                      ) : (
                        <span className="text-[8px] font-mono text-muted-foreground">{m.character.level}</span>
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
  );
}
