import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default async function AllCharactersPage() {
  const characters = await prisma.character.findMany({
    include: { user: true },
    orderBy: { level: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">All Characters</h1>
      <p className="text-muted-foreground mb-8">
        {characters.length} registered characters available for parties
      </p>

      {characters.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No characters registered yet. Be the first to add one!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {characters.map((char) => (
            <Card key={char.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                  {char.level}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{char.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline">{char.className}</Badge>
                    <Badge variant="secondary">{char.world}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                      by {char.user.name}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
