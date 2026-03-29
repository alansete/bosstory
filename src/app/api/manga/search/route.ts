import { NextRequest, NextResponse } from "next/server";

const API = "https://api.mangadex.org";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  if (!q.trim()) {
    return NextResponse.json({ data: [], total: 0 });
  }

  const params = new URLSearchParams({
    title: q,
    limit: String(limit),
    offset: String(offset),
    "includes[]": "cover_art",
    "contentRating[]": "safe",
    "order[relevance]": "desc",
  });
  // Add suggestive as second content rating
  params.append("contentRating[]", "suggestive");

  const res = await fetch(`${API}/manga?${params}`, {
    headers: { "User-Agent": "BossStory/1.0" },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "MangaDex API error" }, { status: 502 });
  }

  const json = await res.json();

  const results = json.data.map((m: any) => {
    const cover = m.relationships?.find((r: any) => r.type === "cover_art");
    const coverFile = cover?.attributes?.fileName;
    return {
      id: m.id,
      title:
        m.attributes.title.en ||
        m.attributes.title["ja-ro"] ||
        Object.values(m.attributes.title)[0] ||
        "Untitled",
      description: m.attributes.description?.en?.slice(0, 200) || "",
      status: m.attributes.status,
      year: m.attributes.year,
      coverUrl: coverFile
        ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}.512.jpg`
        : null,
    };
  });

  return NextResponse.json({
    data: results,
    total: json.total || 0,
    limit,
    offset,
  });
}
