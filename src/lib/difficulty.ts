export const difficultyColor: Record<string, string> = {
  Normal: "text-emerald-400",
  Hard: "text-amber-400",
  Chaos: "text-red-400",
  Extreme: "text-rose-300",
};

export function getDifficultyColor(difficulty: string): string {
  return difficultyColor[difficulty] || "text-white/50";
}
