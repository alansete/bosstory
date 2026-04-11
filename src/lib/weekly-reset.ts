import { prisma } from "./prisma";

// Get the most recent Thursday 00:00 UTC
function getLastResetTime(): Date {
  const now = new Date();
  const utcDay = now.getUTCDay(); // 0=Sun, 4=Thu
  const daysSinceThursday = (utcDay + 3) % 7; // days since last Thursday
  const lastThursday = new Date(now);
  lastThursday.setUTCDate(now.getUTCDate() - daysSinceThursday);
  lastThursday.setUTCHours(0, 0, 0, 0);
  return lastThursday;
}

// Reset all parties that were completed before the last Thursday reset
export async function runWeeklyReset() {
  const lastReset = getLastResetTime();

  await prisma.party.updateMany({
    where: {
      completedAt: {
        not: null,
        lt: lastReset,
      },
    },
    data: {
      completedAt: null,
    },
  });
}
