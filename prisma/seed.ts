import { PrismaClient } from "@prisma/client";

const BOSSES = [
  { id: "extreme-seren", name: "Extreme Seren", difficulty: "Extreme", imageUrl: "/bosses/seren.svg", maxPartySize: 6 },
  { id: "normal-baldrix", name: "Normal Baldrix", difficulty: "Normal", imageUrl: "/bosses/baldrix.svg", maxPartySize: 6 },
  { id: "hard-limbo", name: "Hard Limbo", difficulty: "Hard", imageUrl: "/bosses/limbo.svg", maxPartySize: 6 },
  { id: "hard-kaling", name: "Hard Kaling", difficulty: "Hard", imageUrl: "/bosses/kaling.svg", maxPartySize: 6 },
  { id: "chaos-kalos", name: "Chaos Kalos", difficulty: "Chaos", imageUrl: "/bosses/kalos.svg", maxPartySize: 6 },
  { id: "extreme-kalos", name: "Extreme Kalos", difficulty: "Extreme", imageUrl: "/bosses/kalos.svg", maxPartySize: 6 },
  { id: "hard-first-adversary", name: "Hard First Adversary", difficulty: "Hard", imageUrl: "/bosses/first-adversary.svg", maxPartySize: 6 },
];

const prisma = new PrismaClient();

async function main() {
  for (const boss of BOSSES) {
    await prisma.boss.upsert({
      where: { id: boss.id },
      update: {
        name: boss.name,
        difficulty: boss.difficulty,
        imageUrl: boss.imageUrl,
        maxPartySize: boss.maxPartySize,
      },
      create: {
        id: boss.id,
        name: boss.name,
        difficulty: boss.difficulty,
        imageUrl: boss.imageUrl,
        maxPartySize: boss.maxPartySize,
      },
    });
  }
  console.log("Seeded bosses successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
