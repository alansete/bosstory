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
  const params = new URLSearchParams({
    "translatedLanguage[]": "en",
    limit: "500",
    offset: "0",
    "order[chapter]": "asc",
  });
  const res = await fetch(`${API}/manga/${id}/feed?${params}`, {
    headers: { "User-Agent": "BossStory/1.0" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data
    .filter((c: any) => c.attributes.pages > 0 && !c.attributes.externalUrl)
    .map((c: any) => ({
      id: c.id,
      chapter: c.attributes.chapter,
      title: c.attributes.title || "",
      volume: c.attributes.volume,
      pages: c.attributes.pages,
    }));
}

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
  const desc = m.attributes.description?.en || "";
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
              No English chapters available.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {chapters.map((ch: any) => (
              <Link
                key={ch.id}
                href={`/manga/${id}/${ch.id}`}
                className="flex items-center gap-4 py-2.5 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
              >
                <span className="text-sm font-mono text-muted-foreground w-16 shrink-0">
                  Ch. {ch.chapter || "?"}
                </span>
                <span className="text-sm truncate flex-1">
                  {ch.title || `Chapter ${ch.chapter}`}
                </span>
                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  {ch.pages}p
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
