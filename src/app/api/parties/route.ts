import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bossId, scheduledDate } = await req.json();

  if (!bossId) {
    return NextResponse.json(
      { error: "Boss ID is required" },
      { status: 400 }
    );
  }

  const boss = await prisma.boss.findUnique({ where: { id: bossId } });
  if (!boss) {
    return NextResponse.json({ error: "Boss not found" }, { status: 404 });
  }

  const party = await prisma.party.create({
    data: {
      bossId,
      creatorId: session.user.id,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
    },
  });

  return NextResponse.json(party);
}
