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
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Characters</h1>
        <span className="text-xs font-mono text-muted-foreground">{characters.length}</span>
      </div>

      <AddCharacterForm />

      {characters.length === 0 ? (
        <div className="mt-8 py-20 rounded-lg border border-dashed border-border text-center">
          <p className="text-sm text-muted-foreground">
            Search for a character above to add it to your roster.
          </p>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-border">
          {characters.map((char) => (
            <div
              key={char.id}
              className="group flex items-center gap-4 py-3 first:pt-0"
            >
              {/* Avatar */}
              <div className="size-10 shrink-0 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                {char.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={char.imageUrl} alt="" className="h-9 object-contain" />
                ) : (
                  <span className="text-xs font-mono font-bold text-muted-foreground">{char.level}</span>
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{char.name}</span>
                  <span className="text-xs text-muted-foreground">Lv.{char.level}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{char.className}</span>
                  <span className="text-border">|</span>
                  <span>{char.world}</span>
                </div>
              </div>

              {/* Parties */}
              <div className="hidden sm:flex items-center gap-1.5">
                {char.partyMembers.map((pm) => (
                  <Link
                    key={pm.id}
                    href={`/parties/${pm.party.id}`}
                    className="size-6 rounded overflow-hidden opacity-60 hover:opacity-100 transition-opacity"
                    title={pm.party.boss.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pm.party.boss.imageUrl} alt={pm.party.boss.name} className="w-full h-full object-cover" />
                  </Link>
                ))}
              </div>

              {/* Delete */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <DeleteCharacterButton characterId={char.id} characterName={char.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
