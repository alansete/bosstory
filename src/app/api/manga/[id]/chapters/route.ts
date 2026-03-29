import { NextRequest, NextResponse } from "next/server";

const API = "https://api.mangadex.org";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = 100;
  const offset = (page - 1) * limit;

  const searchParams = new URLSearchParams({
    "translatedLanguage[]": "en",
    limit: String(limit),
    offset: String(offset),
    "order[chapter]": "asc",
  });

  const res = await fetch(`${API}/manga/${id}/feed?${searchParams}`, {
    headers: { "User-Agent": "BossStory/1.0" },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "MangaDex API error" }, { status: 502 });
  }

  const json = await res.json();

  const chapters = json.data
    .filter((c: any) => c.attributes.pages > 0 && !c.attributes.externalUrl)
    .map((c: any) => ({
      id: c.id,
      chapter: c.attributes.chapter,
      title: c.attributes.title || "",
      volume: c.attributes.volume,
      pages: c.attributes.pages,
      publishAt: c.attributes.publishAt,
    }));

  return NextResponse.json({
    data: chapters,
    total: json.total || 0,
    limit,
    offset,
  });
}
