import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AddCharacterForm } from "@/components/add-character-form";
import { DeleteCharacterButton } from "@/components/delete-character-button";

export default async function MyCharactersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const characters = await prisma.character.findMany({
    where: { userId: session.user.id },
    include: {
      partyMembers: {
        include: { party: { include: { boss: true } } },
      },
    },
    orderBy: { level: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Characters</h1>

      <AddCharacterForm />

      {characters.length === 0 ? (
        <div className="mt-8 py-20 rounded-lg border border-dashed border-border text-center">
          <p className="text-sm text-muted-foreground">
            Search for a character above to add it.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <div
              key={char.id}
              className="group relative rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/15 transition-colors"
            >
              {/* Avatar area */}
              <div className="relative h-40 bg-muted flex items-center justify-center overflow-hidden">
                {char.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="h-32 object-contain drop-shadow-lg"
                  />
                ) : (
                  <span className="text-4xl font-bold font-mono text-muted-foreground">
                    {char.level}
                  </span>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteCharacterButton characterId={char.id} characterName={char.name} />
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-base">{char.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">Lv.{char.level}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {char.className} &middot; {char.world}
                </p>

                {char.partyMembers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                    {char.partyMembers.map((pm) => (
                      <Link
                        key={pm.id}
                        href={`/parties/${pm.party.id}`}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pm.party.boss.bgUrl || pm.party.boss.imageUrl}
                          alt=""
                          className="size-5 rounded object-cover"
                        />
                        {pm.party.boss.name}
                      </Link>
                    ))}
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
