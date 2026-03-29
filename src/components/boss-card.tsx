import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Boss } from "@prisma/client";

const difficultyColors: Record<string, string> = {
  Normal: "bg-green-500/20 text-green-400 border-green-500/30",
  Hard: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Chaos: "bg-red-500/20 text-red-400 border-red-500/30",
  Extreme: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function BossCard({
  boss,
  activeParties,
}: {
  boss: Boss;
  activeParties: number;
}) {
  return (
    <Link href={`/bosses/${boss.id}`}>
      <Card className="group overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
        <div className="relative h-48 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={boss.imageUrl}
            alt={boss.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{boss.name}</h3>
              <Badge
                variant="outline"
                className={difficultyColors[boss.difficulty] || ""}
              >
                {boss.difficulty}
              </Badge>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Max Party: {boss.maxPartySize}</span>
            <span>
              {activeParties} active{" "}
              {activeParties === 1 ? "party" : "parties"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
