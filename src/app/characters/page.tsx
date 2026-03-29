import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { AddCharacterForm } from "@/components/add-character-form";
import { DeleteCharacterButton } from "@/components/delete-character-button";
import { Sword, ArrowRight } from "@phosphor-icons/react/dist/ssr";

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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-3xl tracking-tighter font-bold">My Roster</h1>
        <span className="text-sm font-mono text-zinc-500">
          {characters.length} characters
        </span>
      </div>

      <AddCharacterForm />

      {characters.length === 0 ? (
        <div className="mt-10 py-20 border border-dashed border-zinc-700 rounded-lg text-center">
          <p className="text-zinc-500 text-sm">
            Your roster is empty. Search for a character above.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <div
              key={char.id}
              className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-zinc-600 transition-all duration-200"
            >
              {/* Avatar area */}
              <div className="relative h-32 bg-gradient-to-br from-zinc-900 via-zinc-800/80 to-zinc-900 flex items-center justify-center overflow-hidden">
                {char.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="h-24 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="size-16 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold font-mono text-zinc-300">
                    {char.level}
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 bg-zinc-950/70 backdrop-blur-sm rounded px-2 py-0.5">
                  <span className="text-xs font-mono font-semibold text-emerald-400">
                    Lv.{char.level}
                  </span>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteCharacterButton
                    characterId={char.id}
                    characterName={char.name}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-3.5">
                <h3 className="font-semibold tracking-tight truncate">
                  {char.name}
                </h3>
                <div className="flex gap-1.5 mt-1.5">
                  <Badge
                    variant="outline"
                    className="text-[11px] border-zinc-700 text-zinc-300"
                  >
                    {char.className}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-[11px]"
                  >
                    {char.world}
                  </Badge>
                </div>

                {/* Party links */}
                {char.partyMembers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5 font-medium">
                      Parties
                    </p>
                    <div className="flex flex-col gap-1">
                      {char.partyMembers.map((pm) => (
                        <Link
                          key={pm.id}
                          href={`/parties/${pm.party.id}`}
                          className="group/link flex items-center gap-2 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={pm.party.boss.imageUrl}
                            alt={pm.party.boss.name}
                            className="size-4 rounded object-cover"
                          />
                          <span className="truncate flex-1">
                            {pm.party.boss.name}
                          </span>
                          <ArrowRight
                            weight="bold"
                            className="size-3 opacity-0 group-hover/link:opacity-100 transition-opacity"
                          />
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
