import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: partyId } = await params;
  const { characterId } = await req.json();

  if (!characterId) {
    return NextResponse.json(
      { error: "Character ID is required" },
      { status: 400 }
    );
  }

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: { boss: true, members: true },
  });

  if (!party) {
    return NextResponse.json({ error: "Party not found" }, { status: 404 });
  }

  if (party.members.length >= party.boss.maxPartySize) {
    return NextResponse.json({ error: "Party is full" }, { status: 400 });
  }

  const existing = party.members.find((m) => m.characterId === characterId);
  if (existing) {
    return NextResponse.json(
      { error: "Character is already in this party" },
      { status: 400 }
    );
  }

  const member = await prisma.partyMember.create({
    data: { partyId, characterId },
  });

  return NextResponse.json(member);
}
