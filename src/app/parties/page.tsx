import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CreatePartyDialog } from "@/components/create-party-dialog";
import { ScheduleInline } from "@/components/schedule-inline";

export default async function MyPartiesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userCharIds = (
    await prisma.character.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })
  ).map((c) => c.id);

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
      members: { include: { character: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const bosses = await prisma.boss.findMany();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Parties</h1>
        <CreatePartyDialog
          bosses={bosses.map((b) => ({ id: b.id, name: b.name, difficulty: b.difficulty }))}
        />
      </div>

      {parties.length === 0 ? (
        <div className="py-20 border border-dashed border-border rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            No parties yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {parties.map((party) => {
            const isCreator = party.creatorId === session.user!.id;
            return (
              <div key={party.id} className="flex items-center gap-4 py-4">
                {/* Boss thumb */}
                <Link
                  href={`/parties/${party.id}`}
                  className="size-12 shrink-0 rounded-md overflow-hidden bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={party.boss.imageUrl} alt="" className="w-full h-full object-cover" />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/parties/${party.id}`}
                      className="text-sm font-medium hover:underline truncate"
                    >
                      {party.boss.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {party.boss.difficulty}
                    </span>
                    {isCreator && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Creator
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs font-mono text-muted-foreground">
                      {party.members.length}/{party.boss.maxPartySize}
                    </span>
                    <ScheduleInline
                      partyId={party.id}
                      isCreator={isCreator}
                      currentSchedule={party.scheduledDate?.toISOString() || null}
                    />
                  </div>
                </div>

                {/* Member avatars */}
                <div className="hidden sm:flex -space-x-1.5">
                  {party.members.slice(0, 5).map((m) => (
                    <div
                      key={m.id}
                      className="size-7 rounded-full bg-muted border-2 border-background overflow-hidden flex items-center justify-center"
                      title={m.character.name}
                    >
                      {m.character.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.character.imageUrl} alt="" className="h-6 object-contain" />
                      ) : (
                        <span className="text-[9px] font-mono text-muted-foreground">
                          {m.character.level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
