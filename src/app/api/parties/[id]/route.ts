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
  if (party.creatorId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the creator can modify this party" },
      { status: 403 }
    );
  }

  const updateData: Record<string, unknown> = {};

  // Schedule a run
  if (body.scheduledDate !== undefined) {
    // Can't schedule if there's an active (non-completed) scheduled run
    if (party.scheduledDate && !party.completedAt && body.scheduledDate) {
      return NextResponse.json(
        { error: "Complete the current run before scheduling a new one" },
        { status: 400 }
      );
    }
    updateData.scheduledDate = body.scheduledDate
      ? new Date(body.scheduledDate)
      : null;
    // Reset completedAt when scheduling new run
    if (body.scheduledDate) {
      updateData.completedAt = null;
    }
  }

  // Mark run as completed
  if (body.completeRun) {
    if (!party.scheduledDate) {
      return NextResponse.json(
        { error: "No run scheduled to complete" },
        { status: 400 }
      );
    }
    updateData.completedAt = new Date();
  }

  const updated = await prisma.party.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}
