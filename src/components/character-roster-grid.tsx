"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FunnelSimple, SortAscending, SortDescending } from "@phosphor-icons/react";

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
  const [classFilter, setClassFilter] = useState<string>("all");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const filtered = useMemo(() => {
    let result = characters;
    if (classFilter !== "all") {
      result = result.filter((c) => c.className === classFilter);
    }
    return result.sort((a, b) =>
      sortDir === "desc" ? b.level - a.level : a.level - b.level
    );
  }, [characters, classFilter, sortDir]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <FunnelSimple weight="bold" className="size-4" />
          <span>Class:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setClassFilter("all")}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
              classFilter === "all"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-700"
            }`}
          >
            All
          </button>
          {classes.map((c) => (
            <button
              key={c}
              onClick={() => setClassFilter(c)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                classFilter === c
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          className="ml-auto flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {sortDir === "desc" ? (
            <SortDescending weight="bold" className="size-4" />
          ) : (
            <SortAscending weight="bold" className="size-4" />
          )}
          Level {sortDir === "desc" ? "High-Low" : "Low-High"}
        </button>
      </div>

      {/* Results count */}
      <p className="text-xs font-mono text-zinc-500 mb-4">
        {filtered.length} results
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-700 rounded-lg">
          <p className="text-zinc-500 text-sm">
            No characters match this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((char) => (
            <div
              key={char.id}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:border-zinc-600 transition-all duration-200"
            >
              <div className="relative h-28 bg-gradient-to-br from-zinc-900 via-zinc-800/80 to-zinc-900 flex items-center justify-center overflow-hidden">
                {char.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="h-20 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="size-12 rounded-full bg-zinc-700 flex items-center justify-center text-lg font-bold font-mono text-zinc-300">
                    {char.level}
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-zinc-950/70 backdrop-blur-sm rounded px-1.5 py-0.5">
                  <span className="text-[11px] font-mono font-semibold text-emerald-400">
                    Lv.{char.level}
                  </span>
                </div>
              </div>

              <div className="p-3">
                <h3 className="font-semibold tracking-tight text-sm truncate">
                  {char.name}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  by {char.ownerName}
                </p>
                <div className="flex gap-1.5 mt-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] border-zinc-700 text-zinc-400"
                  >
                    {char.className}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {char.world}
                  </Badge>
                </div>

                {char.parties.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-border">
                    <div className="flex flex-col gap-1">
                      {char.parties.map((p) => (
                        <Link
                          key={p.id}
                          href={`/parties/${p.id}`}
                          className="group/link flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-emerald-400 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.bossImage}
                            alt={p.bossName}
                            className="size-3.5 rounded object-cover"
                          />
                          <span className="truncate">{p.bossName}</span>
                          <ArrowRight
                            weight="bold"
                            className="size-2.5 ml-auto opacity-0 group-hover/link:opacity-100 transition-opacity"
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
