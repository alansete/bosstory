import { writeFileSync } from "fs";
import { join } from "path";

const bosses = [
  { file: "seren.webp", name: "SEREN", color1: "#6366f1", color2: "#a855f7" },
  { file: "baldrix.webp", name: "BALDRIX", color1: "#ef4444", color2: "#f97316" },
  { file: "limbo.webp", name: "LIMBO", color1: "#1e293b", color2: "#475569" },
  { file: "kaling.webp", name: "KALING", color1: "#059669", color2: "#14b8a6" },
  { file: "kalos.webp", name: "KALOS", color1: "#dc2626", color2: "#7c3aed" },
  { file: "first-adversary.webp", name: "ADVERSARY", color1: "#0f172a", color2: "#1e40af" },
];

for (const boss of bosses) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${boss.color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${boss.color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)" />
  <text x="400" y="220" text-anchor="middle" font-family="Arial,sans-serif" font-size="72" font-weight="bold" fill="white" opacity="0.3">${boss.name}</text>
  <text x="400" y="300" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="white" opacity="0.5">MapleStory Boss</text>
</svg>`;
  // Save as SVG with .webp extension for now (Next.js Image will handle it)
  // Actually let's save proper SVGs and update the references
  const svgFile = boss.file.replace(".webp", ".svg");
  writeFileSync(join("public", "bosses", svgFile), svg);
  console.log(`Created ${svgFile}`);
}
