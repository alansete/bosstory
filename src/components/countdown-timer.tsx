"use client";

import { useState, useEffect } from "react";

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState(() =>
    getTimeLeft(new Date(targetDate))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(new Date(targetDate)));
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <span className="text-sm font-mono text-white/70">
        Run time!
      </span>
    );
  }

  return (
    <span className="font-mono text-sm text-white/60">
      {timeLeft.days > 0 && (
        <>{timeLeft.days}<span className="text-white/25">d </span></>
      )}
      {String(timeLeft.hours).padStart(2, "0")}
      <span className="text-white/25">h </span>
      {String(timeLeft.minutes).padStart(2, "0")}
      <span className="text-white/25">m </span>
      {String(timeLeft.seconds).padStart(2, "0")}
      <span className="text-white/25">s</span>
    </span>
  );
}
