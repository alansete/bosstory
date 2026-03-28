import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddCharacterForm } from "@/components/add-character-form";
import { DeleteCharacterButton } from "@/components/delete-character-button";

export default async function MyCharactersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const characters = await prisma.character.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">My Characters</h1>

      {/* Add Character Form */}
      <AddCharacterForm />

      {/* Character List */}
      <div className="mt-8 space-y-4">
        {characters.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              You haven&apos;t added any characters yet. Add one above!
            </CardContent>
          </Card>
        ) : (
          characters.map((char) => (
            <Card key={char.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {char.level}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{char.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{char.className}</Badge>
                      <Badge variant="secondary">{char.world}</Badge>
                    </div>
                  </div>
                </div>
                <DeleteCharacterButton characterId={char.id} characterName={char.name} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
