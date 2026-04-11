import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const party = await prisma.party.findUnique({ where: { id } });
  if (!party) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  // Toggle completed
  if (body.toggleComplete !== undefined) {
    updateData.completedAt = party.completedAt ? null : new Date();
  }

  const updated = await prisma.party.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const party = await prisma.party.findUnique({ where: { id } });
  if (!party) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.partyMember.deleteMany({ where: { partyId: id } });
  await prisma.party.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
