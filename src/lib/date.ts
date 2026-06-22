import type { ResumeDate } from "../types";

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function isEmptyDate(d: ResumeDate | undefined): boolean {
  if (!d) return true;
  return !d.year && !d.month && !d.day && !(d.text && d.text.trim());
}

/** Render a ResumeDate for display, based on which parts are present. */
export function formatResumeDate(d: ResumeDate | undefined): string {
  if (!d) return "";
  if (d.text && d.text.trim()) return d.text.trim();
  const mon = d.month ? MONTHS[d.month - 1] : "";
  if (d.year && d.month && d.day) return `${mon} ${d.day}, ${d.year}`;
  if (d.year && d.month) return `${mon} ${d.year}`;
  if (d.month && d.day) return `${mon} ${d.day}`;
  if (d.year) return `${d.year}`;
  if (d.month) return mon;
  return "";
}

/** Days in a given month (1–12), leap-year aware. Falls back to 31. */
export function daysInMonth(month?: number, year?: number): number {
  if (!month) return 31;
  return new Date(year || 2001, month, 0).getDate();
}

/** Year options, newest first: from a few years ahead down ~60 years. */
export function yearOptions(): number[] {
  const now = new Date().getFullYear();
  const out: number[] = [];
  for (let y = now + 8; y >= now - 60; y--) out.push(y);
  return out;
}

/**
 * Best-effort parse of an old free-text date string into a ResumeDate.
 * Used to migrate documents saved before structured dates existed, and when
 * a user turns the free-text toggle back off.
 */
export function parseLegacyDate(input: string | undefined): ResumeDate {
  const s = (input || "").trim();
  if (!s) return {};
  const lower = s.toLowerCase();
  const monIdx = MONTHS.findIndex((m) => lower.includes(m.toLowerCase()));
  const yearMatch = s.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const d: ResumeDate = { year: parseInt(yearMatch[0], 10) };
    if (monIdx >= 0) {
      d.month = monIdx + 1;
      const rest = s.replace(yearMatch[0], "");
      const dayMatch = rest.match(/\b([0-3]?\d)\b/);
      if (dayMatch) {
        const dd = parseInt(dayMatch[1], 10);
        if (dd >= 1 && dd <= 31) d.day = dd;
      }
    }
    return d;
  }
  // No recognizable year — keep it as free text so nothing is lost.
  return { text: s };
}
