"use client";

import { useState } from "react";

export function MangaReader({ pages }: { pages: string[] }) {
  const [loadedCount, setLoadedCount] = useState(0);

  return (
    <div className="space-y-1">
      {/* Progress */}
      {loadedCount < pages.length && (
        <div className="sticky top-12 z-30 bg-background/90 backdrop-blur-sm py-2 mb-4 text-center">
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground/30 transition-all duration-300"
              style={{ width: `${(loadedCount / pages.length) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Loading {loadedCount}/{pages.length}
          </p>
        </div>
      )}

      {/* Pages */}
      {pages.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={url}
          alt={`Page ${i + 1}`}
          className="w-full h-auto"
          loading={i < 3 ? "eager" : "lazy"}
          onLoad={() => setLoadedCount((c) => c + 1)}
        />
      ))}
    </div>
  );
}
