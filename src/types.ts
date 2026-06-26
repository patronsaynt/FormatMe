// ============================================================
// FormatMe — single source of truth for the resume document.
// The same model drives the live preview and every exporter
// (PDF / DOCX / HTML / TXT), so all outputs stay consistent.
// ============================================================

export type ContactType =
  | "phone"
  | "email"
  | "linkedin"
  | "website"
  | "github"
  | "location"
  | "custom";

export interface ContactItem {
  id: string;
  type: ContactType;
  label?: string; // used when type === "custom"
  value: string;
}

/** The shared identity (name + contacts) that applies to every resume by default. */
export interface GlobalProfile {
  name: string;
  /** Default professional title — seeds the headline of new resumes. */
  headline?: string;
  contacts: ContactItem[];
}

/**
 * A flexible date. All parts are optional so the same shape supports
 * year-only, month+year (the common case), or a full date. `text` is a
 * free-text override — when present it is shown verbatim (e.g. "Expected 2025").
 */
export interface ResumeDate {
  year?: number;
  month?: number; // 1–12
  day?: number; // 1–31
  text?: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  remote: boolean;
  startDate: ResumeDate;
  endDate: ResumeDate;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field?: string;
  location?: string;
  startDate: ResumeDate;
  endDate: ResumeDate;
  gpa?: string;
  details: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer?: string;
  date: ResumeDate;
  credentialId?: string;
}

/**
 * One grouped entry within the footer's itemized list — a bolded header with
 * an optional italicized subheader and its own bulleted items, mirroring how
 * Education/Experience entries are structured. Dates are opt-in per entry
 * since footer content (hobbies, side projects, etc.) usually isn't dated.
 */
export interface FooterEntry {
  id: string;
  header: string;
  subheader?: string;
  showDate?: boolean;
  startDate?: ResumeDate;
  endDate?: ResumeDate;
  bullets: string[];
}

export interface ResumeFooter {
  enabled: boolean;
  title: string; // e.g. "Interests"
  entries: FooterEntry[];
}

export interface ResumeMeta {
  templateId: string;
  fontId: string; // key into the font registry
  accentColor: string; // hex, used by templates
  pageSize: "LETTER" | "A4";

  // ---- Document-wide formatting ----
  density: number; // master spacing scale (margins, gaps, padding). 1 = default
  fontScale: number; // master text-size scale. 1 = default
  // Advanced (granular) tweaks:
  lineHeight: number; // text line-height multiple
  letterSpacing: number; // points of tracking between letters
}

/** Sensible defaults, also used to backfill older saved documents. */
export const LAYOUT_DEFAULTS = {
  density: 1,
  fontScale: 1,
  lineHeight: 1.4,
  letterSpacing: 0,
} as const;

/** Body sections whose order in the document the user can rearrange. */
export type SectionKey = "summary" | "work" | "education" | "certifications" | "footer";

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "summary",
  "work",
  "education",
  "certifications",
  "footer",
];

export const SECTION_LABEL: Record<SectionKey, string> = {
  summary: "Summary",
  work: "Work Experience",
  education: "Education",
  certifications: "Certifications",
  footer: "Footer",
};

export interface Resume {
  name: string;
  headline?: string; // optional professional title under the name
  contacts: ContactItem[]; // the subheader row
  summary?: string; // optional professional summary
  work: WorkExperience[];
  education: Education[];
  certifications: Certification[]; // optional — hidden when empty
  footer: ResumeFooter; // optional — hidden unless enabled
  sectionOrder: SectionKey[]; // order body sections appear in the document
  meta: ResumeMeta;
  /** When true, this resume's own name/contacts are used instead of the global profile. */
  identityOverride?: boolean;
}

/** Complete, de-duplicated section order (guards older/partial documents). */
export function normalizeSectionOrder(order?: SectionKey[]): SectionKey[] {
  const base = order?.length ? order : DEFAULT_SECTION_ORDER;
  const seen = new Set<SectionKey>();
  const result: SectionKey[] = [];
  for (const k of [...base, ...DEFAULT_SECTION_ORDER]) {
    if (!seen.has(k)) {
      seen.add(k);
      result.push(k);
    }
  }
  return result;
}

export function orderedSections(resume: Resume): SectionKey[] {
  return normalizeSectionOrder(resume.sectionOrder);
}

export const CONTACT_META: Record<
  ContactType,
  { label: string; placeholder: string }
> = {
  phone: { label: "Phone", placeholder: "just digits, e.g. 3175550182" },
  email: { label: "Email", placeholder: "you@example.com" },
  linkedin: { label: "LinkedIn", placeholder: "handle only, e.g. janedoe" },
  website: { label: "Website", placeholder: "yoursite.com" },
  github: { label: "GitHub", placeholder: "handle only, e.g. janedoe" },
  location: { label: "Location", placeholder: "City, State" },
  custom: { label: "Custom", placeholder: "Anything else" },
};
