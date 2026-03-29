import Link from "next/link";
import { notFound } from "next/navigation";

const API = "https://api.mangadex.org";

async function getManga(id: string) {
  const res = await fetch(
    `${API}/manga/${id}?includes[]=cover_art&includes[]=author`,
    { headers: { "User-Agent": "BossStory/1.0" }, next: { revalidate: 300 } }
  );
  if (!res.ok) return null;
  return res.json();
}

async function getChapters(id: string) {
  // Fetch Spanish and English chapters
  const params = new URLSearchParams({
    limit: "500",
    offset: "0",
    "order[chapter]": "asc",
  });
  params.append("translatedLanguage[]", "es-la");
  params.append("translatedLanguage[]", "es");
  params.append("translatedLanguage[]", "en");

  const res = await fetch(`${API}/manga/${id}/feed?${params}`, {
    headers: { "User-Agent": "BossStory/1.0" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const json = await res.json();

  const all = json.data
    .filter((c: any) => c.attributes.pages > 0 && !c.attributes.externalUrl)
    .map((c: any) => ({
      id: c.id,
      chapter: c.attributes.chapter,
      title: c.attributes.title || "",
      volume: c.attributes.volume,
      pages: c.attributes.pages,
      lang: c.attributes.translatedLanguage as string,
    }));

  // Group by chapter number, prefer ES > ES-LA > EN
  const grouped = new Map<string, (typeof all)[number]>();
  const langPriority: Record<string, number> = { es: 0, "es-la": 1, en: 2 };

  for (const ch of all) {
    const key = ch.chapter || ch.id;
    const existing = grouped.get(key);
    if (
      !existing ||
      (langPriority[ch.lang] ?? 99) < (langPriority[existing.lang] ?? 99)
    ) {
      grouped.set(key, ch);
    }
  }

  // Also keep alternate languages as options
  const chaptersMap = new Map<
    string,
    { best: (typeof all)[number]; alternates: (typeof all)[number][] }
  >();
  for (const ch of all) {
    const key = ch.chapter || ch.id;
    if (!chaptersMap.has(key)) {
      chaptersMap.set(key, { best: grouped.get(key)!, alternates: [] });
    }
    const entry = chaptersMap.get(key)!;
    if (ch.id !== entry.best.id) {
      entry.alternates.push(ch);
    }
  }

  return Array.from(chaptersMap.values()).sort((a, b) => {
    const na = parseFloat(a.best.chapter || "0");
    const nb = parseFloat(b.best.chapter || "0");
    return na - nb;
  });
}

const langLabel: Record<string, string> = {
  es: "ES",
  "es-la": "ES",
  en: "EN",
};

const langColor: Record<string, string> = {
  es: "bg-amber-500/15 text-amber-400",
  "es-la": "bg-amber-500/15 text-amber-400",
  en: "bg-blue-500/15 text-blue-400",
};

export default async function MangaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const manga = await getManga(id);
  if (!manga) notFound();

  const m = manga.data;
  const title =
    m.attributes.title.en ||
    m.attributes.title["ja-ro"] ||
    Object.values(m.attributes.title)[0] ||
    "Untitled";
  const desc =
    m.attributes.description?.es ||
    m.attributes.description?.en ||
    "";
  const cover = m.relationships?.find((r: any) => r.type === "cover_art");
  const coverUrl = cover?.attributes?.fileName
    ? `https://uploads.mangadex.org/covers/${id}/${cover.attributes.fileName}.512.jpg`
    : null;
  const author = m.relationships?.find((r: any) => r.type === "author");
  const authorName = author?.attributes?.name || null;

  const chapters = await getChapters(id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/manga"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back to search
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 mt-4 mb-10">
        {coverUrl && (
          <div className="w-40 sm:w-48 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter">
            {title}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            {authorName && <span>{authorName}</span>}
            {m.attributes.status && (
              <span className="capitalize">{m.attributes.status}</span>
            )}
            {m.attributes.year && <span>{m.attributes.year}</span>}
          </div>
          {desc && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-4">
              {desc}
            </p>
          )}
        </div>
      </div>

      {/* Chapters */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Chapters
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {chapters.length}
          </span>
        </div>

        {chapters.length === 0 ? (
          <div className="py-16 border border-dashed border-border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              No chapters available in Spanish or English.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {chapters.map(({ best, alternates }) => (
              <div key={best.id} className="flex items-center gap-3 py-2.5">
                <span className="text-sm font-mono text-muted-foreground w-16 shrink-0">
                  Ch. {best.chapter || "?"}
                </span>

                {/* Primary link */}
                <Link
                  href={`/manga/${id}/${best.id}`}
                  className="flex items-center gap-2 flex-1 min-w-0 hover:text-foreground transition-colors"
                >
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${langColor[best.lang] || "bg-muted text-muted-foreground"}`}
                  >
                    {langLabel[best.lang] || best.lang.toUpperCase()}
                  </span>
                  <span className="text-sm truncate">
                    {best.title || `Chapter ${best.chapter}`}
                  </span>
                </Link>

                {/* Alternate languages */}
                {alternates.map((alt) => (
                  <Link
                    key={alt.id}
                    href={`/manga/${id}/${alt.id}`}
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 hover:opacity-80 transition-opacity ${langColor[alt.lang] || "bg-muted text-muted-foreground"}`}
                    title={`Read in ${langLabel[alt.lang] || alt.lang}`}
                  >
                    {langLabel[alt.lang] || alt.lang.toUpperCase()}
                  </Link>
                ))}

                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  {best.pages}p
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
