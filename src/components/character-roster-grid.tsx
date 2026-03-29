"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type CharacterData = {
  id: string;
  name: string;
  className: string;
  level: number;
  world: string;
  imageUrl: string | null;
  ownerName: string;
  parties: { id: string; bossName: string; bossImage: string }[];
};

export function CharacterRosterGrid({
  characters,
  classes,
}: {
  characters: CharacterData[];
  classes: string[];
}) {
  const [classFilter, setClassFilter] = useState("all");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const filtered = useMemo(() => {
    let result = characters;
    if (classFilter !== "all") {
      result = result.filter((c) => c.className === classFilter);
    }
    return [...result].sort((a, b) =>
      sortDir === "desc" ? b.level - a.level : a.level - b.level
    );
  }, [characters, classFilter, sortDir]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-border">
        <span className="text-xs text-muted-foreground mr-1">Class</span>
        <button
          onClick={() => setClassFilter("all")}
          className={`text-xs px-2 py-0.5 rounded transition-colors ${classFilter === "all" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          All
        </button>
        {classes.map((c) => (
          <button
            key={c}
            onClick={() => setClassFilter(c)}
            className={`text-xs px-2 py-0.5 rounded transition-colors ${classFilter === c ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Level {sortDir === "desc" ? "\u2193" : "\u2191"}
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-4 font-mono">
        {filtered.length} results
      </p>

      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">No matches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((char) => (
            <div
              key={char.id}
              className="rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/15 transition-colors"
            >
              <div className="h-32 bg-muted flex items-center justify-center overflow-hidden">
                {char.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={char.imageUrl} alt="" className="h-28 object-contain" />
                ) : (
                  <span className="text-3xl font-bold font-mono text-muted-foreground">{char.level}</span>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">{char.name}</span>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">{char.level}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {char.className} &middot; {char.world}
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                  {char.ownerName}
                </p>
                {char.parties.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border flex flex-wrap gap-1.5">
                    {char.parties.map((p) => (
                      <Link
                        key={p.id}
                        href={`/parties/${p.id}`}
                        className="size-5 rounded overflow-hidden opacity-60 hover:opacity-100 transition-opacity"
                        title={p.bossName}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.bossImage} alt="" className="w-full h-full object-cover" />
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
