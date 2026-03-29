import Link from "next/link";
import { notFound } from "next/navigation";
import { MangaReader } from "@/components/manga-reader";

const API = "https://api.mangadex.org";

async function getChapterPages(chapterId: string) {
  const res = await fetch(`${API}/at-home/server/${chapterId}`, {
    headers: { "User-Agent": "BossStory/1.0" },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return {
    pages: json.chapter.data.map(
      (f: string) => `${json.baseUrl}/data/${json.chapter.hash}/${f}`
    ),
    pagesSaver: json.chapter.dataSaver.map(
      (f: string) =>
        `${json.baseUrl}/data-saver/${json.chapter.hash}/${f}`
    ),
  };
}

async function getChapterInfo(chapterId: string) {
  const res = await fetch(`${API}/chapter/${chapterId}?includes[]=manga`, {
    headers: { "User-Agent": "BossStory/1.0" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id, chapterId } = await params;

  const [pageData, chapterInfo] = await Promise.all([
    getChapterPages(chapterId),
    getChapterInfo(chapterId),
  ]);

  if (!pageData) notFound();

  const chNum = chapterInfo?.data?.attributes?.chapter || "?";
  const chTitle = chapterInfo?.data?.attributes?.title || "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Nav bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <Link
          href={`/manga/${id}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Chapter list
        </Link>
        <div className="text-center">
          <p className="text-sm font-medium">Chapter {chNum}</p>
          {chTitle && (
            <p className="text-xs text-muted-foreground">{chTitle}</p>
          )}
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {pageData.pages.length}p
        </span>
      </div>

      {/* Reader */}
      <MangaReader pages={pageData.pages} />

      {/* Bottom nav */}
      <div className="mt-8 pt-4 border-t border-border text-center">
        <Link
          href={`/manga/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to chapter list
        </Link>
      </div>
    </div>
  );
}
