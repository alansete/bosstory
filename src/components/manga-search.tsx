"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass } from "@phosphor-icons/react";

type MangaResult = {
  id: string;
  title: string;
  description: string;
  status: string | null;
  year: number | null;
  coverUrl: string | null;
};

export function MangaSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MangaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/manga/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      setResults(data.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlass
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search manga..."
            className="pl-9"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-9 items-center rounded-md bg-foreground text-background px-4 text-sm font-medium hover:bg-foreground/90 active:scale-[0.97] transition-all disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-lg bg-muted" />
              <div className="mt-2 h-4 rounded bg-muted w-3/4" />
              <div className="mt-1 h-3 rounded bg-muted w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="py-16 text-center border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">No results found.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((manga) => (
            <Link
              key={manga.id}
              href={`/manga/${manga.id}`}
              className="group block active:scale-[0.98] transition-transform"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                {manga.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={manga.coverUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No cover
                  </div>
                )}
              </div>
              <h3 className="mt-2 text-sm font-medium leading-tight line-clamp-2 group-hover:text-foreground transition-colors">
                {manga.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {manga.year && <span>{manga.year}</span>}
                {manga.status && (
                  <span className="capitalize">{manga.status}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
