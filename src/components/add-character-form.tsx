"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type LookupResult = {
  name: string;
  className: string;
  level: number;
  world: string;
  imageUrl?: string;
} | null;

export function AddCharacterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<LookupResult>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch(
        `/api/characters/lookup?name=${encodeURIComponent(name.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Character not found");
        return;
      }
      setResult(data);
    } catch {
      setError("Failed to look up character");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.name,
          className: result.className,
          level: result.level,
          world: result.world,
          imageUrl: result.imageUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add character");
      }
      toast.success(`${result.name} added!`);
      setName("");
      setResult(null);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add character"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Character</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="charName">Character Name (IGN)</Label>
            <Input
              id="charName"
              placeholder="Enter your IGN..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {result && (
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
            {result.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.imageUrl}
                alt={result.name}
                className="w-16 h-16 object-contain"
              />
            )}
            <div className="flex-1">
              <p className="font-bold text-lg">{result.name}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline">Lv. {result.level}</Badge>
                <Badge variant="secondary">{result.className}</Badge>
                <Badge variant="secondary">{result.world}</Badge>
              </div>
            </div>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? "Adding..." : "Add"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
