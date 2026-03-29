"use client";

import { useState, useEffect } from "react";
import { Timer } from "@phosphor-icons/react";

function getTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, total: diff };
}

export function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState(() =>
    getTimeLeft(new Date(targetDate))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(new Date(targetDate)));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-mono">
        <Timer weight="bold" className="size-3.5" />
        <span>Run time!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 mt-2">
      <Timer weight="bold" className="size-3.5 text-zinc-500" />
      <div className="flex items-center gap-1 font-mono text-sm">
        {timeLeft.days > 0 && (
          <span className="text-zinc-300">
            {timeLeft.days}
            <span className="text-zinc-600 text-xs">d</span>
          </span>
        )}
        <span className="text-zinc-300">
          {String(timeLeft.hours).padStart(2, "0")}
          <span className="text-zinc-600 text-xs">h</span>
        </span>
        <span className="text-zinc-300">
          {String(timeLeft.minutes).padStart(2, "0")}
          <span className="text-zinc-600 text-xs">m</span>
        </span>
        <span className="text-zinc-300">
          {String(timeLeft.seconds).padStart(2, "0")}
          <span className="text-zinc-600 text-xs">s</span>
        </span>
      </div>
    </div>
  );
}
