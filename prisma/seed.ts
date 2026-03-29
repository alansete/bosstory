import { PrismaClient } from "@prisma/client";

const BOSSES = [
  { id: "extreme-seren", name: "Extreme Seren", difficulty: "Extreme", imageUrl: "/bosses/bg/seren.png", bgUrl: "/bosses/bg/seren.png", gifUrl: "/bosses/gif/seren.gif", maxPartySize: 6 },
  { id: "normal-baldrix", name: "Normal Baldrix", difficulty: "Normal", imageUrl: "/bosses/bg/baldrix.png", bgUrl: "/bosses/bg/baldrix.png", gifUrl: "/bosses/gif/baldrix.gif", maxPartySize: 6 },
  { id: "hard-limbo", name: "Hard Limbo", difficulty: "Hard", imageUrl: "/bosses/bg/limbo.png", bgUrl: "/bosses/bg/limbo.png", gifUrl: "/bosses/gif/limbo.png", maxPartySize: 6 },
  { id: "hard-kaling", name: "Hard Kaling", difficulty: "Hard", imageUrl: "/bosses/bg/kaling.png", bgUrl: "/bosses/bg/kaling.png", gifUrl: "/bosses/gif/kaling.gif", maxPartySize: 6 },
  { id: "chaos-kalos", name: "Chaos Kalos", difficulty: "Chaos", imageUrl: "/bosses/bg/kalos.png", bgUrl: "/bosses/bg/kalos.png", gifUrl: "/bosses/gif/kalos.gif", maxPartySize: 6 },
  { id: "extreme-kalos", name: "Extreme Kalos", difficulty: "Extreme", imageUrl: "/bosses/bg/kalos.png", bgUrl: "/bosses/bg/kalos.png", gifUrl: "/bosses/gif/kalos.gif", maxPartySize: 6 },
  { id: "hard-first-adversary", name: "Hard First Adversary", difficulty: "Hard", imageUrl: "/bosses/bg/first-adversary.png", bgUrl: "/bosses/bg/first-adversary.png", gifUrl: "/bosses/gif/first-adversary.gif", maxPartySize: 6 },
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
        bgUrl: boss.bgUrl,
        gifUrl: boss.gifUrl,
        maxPartySize: boss.maxPartySize,
      },
      create: boss,
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
