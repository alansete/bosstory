import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { AddCharacterForm } from "@/components/add-character-form";
import { DeleteCharacterButton } from "@/components/delete-character-button";

export default async function MyCharactersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const characters = await prisma.character.findMany({
    where: { userId: session.user.id },
    include: {
      partyMembers: {
        include: {
          party: {
            include: { boss: true },
          },
        },
      },
    },
    orderBy: { level: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">My Roster</h1>

      <AddCharacterForm />

      {characters.length === 0 ? (
        <div className="mt-8 text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground text-lg">
            Your roster is empty. Search for your character above!
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {characters.map((char) => (
            <div
              key={char.id}
              className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
            >
              {/* Character header with gradient */}
              <div className="relative h-36 bg-gradient-to-br from-purple-900/60 via-indigo-900/40 to-black flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,60,255,0.15),transparent_60%)]" />
                {char.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="h-28 object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
                    {char.level}
                  </div>
                )}
                {/* Level badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1">
                  <span className="text-xs font-heading font-bold text-purple-300">
                    Lv. {char.level}
                  </span>
                </div>
                {/* Delete */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteCharacterButton
                    characterId={char.id}
                    characterName={char.name}
                  />
                </div>
              </div>

              {/* Character info */}
              <div className="p-4">
                <h3 className="font-heading font-bold text-lg truncate">
                  {char.name}
                </h3>
                <div className="flex gap-2 mt-1.5">
                  <Badge
                    variant="outline"
                    className="text-xs border-purple-500/30 text-purple-300"
                  >
                    {char.className}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {char.world}
                  </Badge>
                </div>

                {/* Parties */}
                {char.partyMembers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                      Active Parties
                    </p>
                    <div className="flex flex-col gap-1">
                      {char.partyMembers.map((pm) => (
                        <Link
                          key={pm.id}
                          href={`/parties/${pm.party.id}`}
                          className="flex items-center gap-2 text-xs hover:text-purple-400 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={pm.party.boss.imageUrl}
                            alt={pm.party.boss.name}
                            className="w-5 h-5 rounded object-cover"
                          />
                          <span className="truncate">
                            {pm.party.boss.name}
                          </span>
                          {pm.party.scheduledDate && (
                            <span className="text-muted-foreground ml-auto shrink-0">
                              {new Date(
                                pm.party.scheduledDate
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
