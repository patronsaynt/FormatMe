import type { Resume, ContactItem, WorkExperience, ResumeDate, Certification } from "../types";
import { LAYOUT_DEFAULTS } from "../types";
import { getFont } from "../fonts/registry";
import { formatContactValue } from "../lib/format";
import { formatResumeDate } from "../lib/date";

export interface Metrics {
  /** scale a font size by the document's font scale */
  fs: (n: number) => number;
  /** scale a spacing value (margin/padding/gap) by the document's density */
  sp: (n: number) => number;
  lineHeight: number;
  letterSpacing: number;
}

/**
 * Builds the scaling functions a template uses so every font size and spacing
 * value responds to the document-wide Formatting controls. Falls back to
 * defaults for older saved documents that lack the fields.
 */
export function metrics(resume: Resume): Metrics {
  const m = resume.meta;
  const density = m.density ?? LAYOUT_DEFAULTS.density;
  const fontScale = m.fontScale ?? LAYOUT_DEFAULTS.fontScale;
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    fs: (n) => round(n * fontScale),
    sp: (n) => round(n * density),
    lineHeight: m.lineHeight ?? LAYOUT_DEFAULTS.lineHeight,
    letterSpacing: m.letterSpacing ?? LAYOUT_DEFAULTS.letterSpacing,
  };
}

/** Location to show for a job — "Remote" overrides any typed location. */
export function workLocation(w: WorkExperience): string {
  return w.remote ? "Remote" : (w.location || "").trim();
}

export function fontFamilyFor(resume: Resume): string {
  return getFont(resume.meta.fontId).family;
}

/** "Name — Issuer (ID: ...)" — the credential ID only appears once it's filled in. */
export function certificationLabel(c: Certification): string {
  const base = c.name + (c.issuer ? ` — ${c.issuer}` : "");
  return c.credentialId?.trim() ? `${base} (ID: ${c.credentialId.trim()})` : base;
}

/**
 * Visible contacts with their values formatted for display. Formatting happens
 * here (at render time) so the resume & every export always show a tidy value —
 * e.g. 3174522849 -> (317)-452-2849 — without waiting for the field to blur.
 */
export function visibleContacts(resume: Resume): ContactItem[] {
  return resume.contacts
    .filter((c) => c.value.trim() !== "")
    .map((c) => ({ ...c, value: formatContactValue(c.type, c.value) }));
}

export function dateRange(
  start?: ResumeDate,
  end?: ResumeDate,
  current?: boolean,
): string {
  const s = formatResumeDate(start);
  const e = current ? "Present" : formatResumeDate(end);
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}

export function hasContent(resume: Resume): boolean {
  return Boolean(
    resume.name.trim() ||
      resume.work.length ||
      resume.education.length ||
      visibleContacts(resume).length,
  );
}

/** Lighten/darken a hex color for subtle template accents. */
export function shade(hex: string, amount: number): string {
  const m = hex.replace("#", "");
  const num = parseInt(m.length === 3 ? m.replace(/(.)/g, "$1$1") : m, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.round(r + amount * 255)));
  g = Math.max(0, Math.min(255, Math.round(g + amount * 255)));
  b = Math.max(0, Math.min(255, Math.round(b + amount * 255)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
