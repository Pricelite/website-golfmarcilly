import { blackFriday2026ClosesAt, blackFriday2026OpensAt } from "@/data/offers";

const opensAt = Date.parse(blackFriday2026OpensAt);
const closesAt = Date.parse(blackFriday2026ClosesAt);

export function getBlackFriday2026Timing(now: number) {
  const phase = now < opensAt ? "upcoming" : now < closesAt ? "active" : "ended";
  return {
    phase,
    remainingMs: Math.max(0, (phase === "upcoming" ? opensAt : closesAt) - now),
  };
}

export function formatOfferCountdown(remainingMs: number): string {
  const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return `${days} j ${String(hours).padStart(2, "0")} h ${String(minutes).padStart(2, "0")} min ${String(seconds).padStart(2, "0")} s`;
}
