import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, className, level, world } = await req.json();

  if (!name || !className || !level || !world) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  const character = await prisma.character.create({
    data: {
      name,
      className,
      level: parseInt(level),
      world,
      userId: session.user.id,
    },
  });

  return NextResponse.json(character);
}
