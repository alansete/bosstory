export const BOSSES = [
  {
    id: "extreme-seren",
    name: "Extreme Seren",
    difficulty: "Extreme",
    imageUrl: "/bosses/seren.svg",
    maxPartySize: 6,
  },
  {
    id: "normal-baldrix",
    name: "Normal Baldrix",
    difficulty: "Normal",
    imageUrl: "/bosses/baldrix.svg",
    maxPartySize: 6,
  },
  {
    id: "hard-limbo",
    name: "Hard Limbo",
    difficulty: "Hard",
    imageUrl: "/bosses/limbo.svg",
    maxPartySize: 6,
  },
  {
    id: "hard-kaling",
    name: "Hard Kaling",
    difficulty: "Hard",
    imageUrl: "/bosses/kaling.svg",
    maxPartySize: 6,
  },
  {
    id: "chaos-kalos",
    name: "Chaos Kalos",
    difficulty: "Chaos",
    imageUrl: "/bosses/kalos.svg",
    maxPartySize: 6,
  },
  {
    id: "extreme-kalos",
    name: "Extreme Kalos",
    difficulty: "Extreme",
    imageUrl: "/bosses/kalos.svg",
    maxPartySize: 6,
  },
  {
    id: "hard-first-adversary",
    name: "Hard First Adversary",
    difficulty: "Hard",
    imageUrl: "/bosses/first-adversary.svg",
    maxPartySize: 6,
  },
] as const;

export const MAPLE_CLASSES = [
  // Explorers
  "Hero", "Paladin", "Dark Knight",
  "Arch Mage (F/P)", "Arch Mage (I/L)", "Bishop",
  "Bowmaster", "Marksman", "Pathfinder",
  "Night Lord", "Shadower", "Dual Blade",
  "Buccaneer", "Corsair", "Cannoneer",
  // Cygnus Knights
  "Dawn Warrior", "Blaze Wizard", "Wind Archer", "Night Walker", "Thunder Breaker", "Mihile",
  // Heroes
  "Aran", "Evan", "Mercedes", "Phantom", "Luminous", "Shade",
  // Resistance
  "Demon Slayer", "Demon Avenger", "Battle Mage", "Wild Hunter", "Mechanic", "Xenon", "Blaster",
  // Nova
  "Kaiser", "Angelic Buster", "Cadena", "Kain",
  // Flora
  "Adele", "Illium", "Ark", "Khali",
  // Anima
  "Hoyoung", "Lara",
  // Other
  "Hayato", "Kanna",
  "Zero", "Kinesis", "Lynn",
] as const;

export const MAPLE_WORLDS = [
  "Scania", "Bera", "Aurora", "Elysium", "Burning",
  "Heroic Kronos", "Heroic Hyperion",
] as const;

export type BossData = (typeof BOSSES)[number];
