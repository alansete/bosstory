"use client";

import { CountdownTimer } from "./countdown-timer";

export function ScheduleBanner({
  scheduledDate,
  isActive,
}: {
  scheduledDate: string;
  isActive: boolean;
}) {
  const date = new Date(scheduledDate);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
        {isActive ? "Next Run" : "Completed"}
      </p>
      <p className="text-lg font-semibold text-white tracking-tight">
        {date.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      {isActive && (
        <div className="mt-2">
          <CountdownTimer targetDate={scheduledDate} />
        </div>
      )}
    </div>
  );
}
