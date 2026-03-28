"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MAPLE_CLASSES, MAPLE_WORLDS } from "@/lib/bosses";

export function AddCharacterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [level, setLevel] = useState("");
  const [world, setWorld] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !className || !level || !world) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          className,
          level: parseInt(level),
          world,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add character");
      }
      toast.success(`${name} added successfully!`);
      setName("");
      setClassName("");
      setLevel("");
      setWorld("");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add character"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Character</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="charName">Character Name</Label>
            <Input
              id="charName"
              placeholder="IGN"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="charClass">Class</Label>
            <Select value={className} onValueChange={(v) => setClassName(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select class..." />
              </SelectTrigger>
              <SelectContent>
                {MAPLE_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="charLevel">Level</Label>
            <Input
              id="charLevel"
              type="number"
              min="1"
              max="300"
              placeholder="260"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="charWorld">World</Label>
            <Select value={world} onValueChange={(v) => setWorld(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select world..." />
              </SelectTrigger>
              <SelectContent>
                {MAPLE_WORLDS.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Adding..." : "Add Character"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
