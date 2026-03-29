import { NextRequest, NextResponse } from "next/server";

const API = "https://api.mangadex.org";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const res = await fetch(`${API}/at-home/server/${id}`, {
    headers: { "User-Agent": "BossStory/1.0" },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "MangaDex API error" }, { status: 502 });
  }

  const json = await res.json();

  const pages = json.chapter.data.map(
    (filename: string) =>
      `${json.baseUrl}/data/${json.chapter.hash}/${filename}`
  );

  const pagesSaver = json.chapter.dataSaver.map(
    (filename: string) =>
      `${json.baseUrl}/data-saver/${json.chapter.hash}/${filename}`
  );

  return NextResponse.json({ pages, pagesSaver });
}
