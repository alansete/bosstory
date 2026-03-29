// Nexon worldID to world name mapping for GMS
export const WORLD_ID_MAP: Record<number, string> = {
  0: "Scania",
  1: "Bera",
  2: "Broa",
  3: "Windia",
  4: "Khaini",
  5: "Bellocan",
  6: "Mardia",
  7: "Kradia",
  8: "Yellonde",
  9: "Demethos",
  10: "Galicia",
  11: "El Nido",
  12: "Zenith",
  13: "Arcania",
  14: "Chaos",
  15: "Nova",
  16: "Renegades",
  17: "Aurora",
  18: "Elysium",
  19: "Burning",
  45: "Heroic Kronos",
  46: "Heroic Hyperion",
};

export function getWorldName(worldId: number): string {
  return WORLD_ID_MAP[worldId] || `World ${worldId}`;
}
