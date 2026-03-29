import { NextRequest, NextResponse } from "next/server";
import { getWorldName } from "@/lib/worlds";

const NEXON_RANKING_API =
  "https://www.nexon.com/api/maplestory/no-auth/ranking/v2/na";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Character name is required (min 2 chars)" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${NEXON_RANKING_API}?type=overall&id=weekly&reboot_index=0&page_index=1&character_name=${encodeURIComponent(name)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from Nexon API" },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (!data.ranks || data.ranks.length === 0) {
      return NextResponse.json(
        { error: "Character not found in rankings" },
        { status: 404 }
      );
    }

    const char = data.ranks[0];

    return NextResponse.json({
      name: char.characterName,
      className: char.jobName,
      level: char.level,
      world: getWorldName(char.worldID),
      imageUrl: char.characterImgURL,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to look up character" },
      { status: 500 }
    );
  }
}
