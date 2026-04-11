import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: partyId, memberId } = await params;

  const party = await prisma.party.findUnique({ where: { id: partyId } });
  if (!party) {
    return NextResponse.json({ error: "Party not found" }, { status: 404 });
  }

  const member = await prisma.partyMember.findUnique({
    where: { id: memberId },
  });
  if (!member || member.partyId !== partyId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  await prisma.partyMember.delete({ where: { id: memberId } });

  return NextResponse.json({ ok: true });
}
