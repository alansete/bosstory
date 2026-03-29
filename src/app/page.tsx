import Link from "next/link";
import { prisma } from "@/lib/prisma";

const diffColor: Record<string, string> = {
  Normal: "text-emerald-400",
  Hard: "text-amber-400",
  Chaos: "text-red-400",
  Extreme: "text-rose-300",
};

export default async function Home() {
  const bosses = await prisma.boss.findMany({
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

  const allParties = bosses.flatMap((b) =>
    b.parties.map((p) => ({ ...p, boss: b }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Boss mosaic */}
      <section className="py-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Bosses</h2>
          <Link href="/bosses" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {bosses.map((boss) => (
            <Link
              key={boss.id}
              href={`/bosses/${boss.id}`}
              className="group relative block aspect-square rounded-lg overflow-hidden bg-muted active:scale-[0.98] transition-transform"
            >
              {/* Background */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={boss.bgUrl || boss.imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Boss GIF centered */}
              {boss.gifUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={boss.gifUrl}
                    alt={boss.name}
                    className="h-2/3 object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-300 mix-blend-multiply"
                  />
                </div>
              )}

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  {boss.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[11px] font-semibold ${diffColor[boss.difficulty] || "text-white/50"}`}>
                    {boss.difficulty}
                  </span>
                  {boss.parties.length > 0 && (
                    <span className="text-[11px] text-white/30 font-mono">
                      {boss.parties.length} {boss.parties.length === 1 ? "party" : "parties"}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Active parties */}
      <section className="border-t border-border py-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Active Parties</h2>
          <span className="text-xs font-mono text-muted-foreground">{allParties.length}</span>
        </div>

        {allParties.length === 0 ? (
          <div className="py-16 border border-dashed border-border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              No active parties. Sign in to create one.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {allParties.map((party) => (
              <Link
                key={party.id}
                href={`/parties/${party.id}`}
                className="flex items-center gap-4 py-3 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="size-10 shrink-0 rounded overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={party.boss.bgUrl || party.boss.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {party.boss.name}
                    </span>
                    <span className={`text-[11px] font-semibold ${diffColor[party.boss.difficulty] || "text-muted-foreground"}`}>
                      {party.boss.difficulty}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {party.creator.name} &middot;{" "}
                    {party.scheduledDate
                      ? new Date(party.scheduledDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                      : "No date"}
                  </div>
                </div>
                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  {party.members.length}/{party.boss.maxPartySize}
                </span>
                <div className="hidden sm:flex -space-x-1.5">
                  {party.members.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      className="size-7 rounded-full bg-muted border-2 border-background overflow-hidden flex items-center justify-center"
                    >
                      {m.character.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.character.imageUrl} alt="" className="h-6 object-contain" />
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
      </section>
    </div>
  );
}
