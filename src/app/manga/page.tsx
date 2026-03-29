import { MangaSearch } from "@/components/manga-search";

export default function MangaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Manga</h1>
      <MangaSearch />
    </div>
  );
}
