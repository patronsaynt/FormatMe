import type {
  Resume,
  ContactItem,
  WorkExperience,
  Education,
  Certification,
  ResumeDate,
} from "../types";
import { LAYOUT_DEFAULTS, DEFAULT_SECTION_ORDER } from "../types";
import { uid } from "../lib/id";
import { formatContactValue } from "../lib/format";
import { parseLegacyDate } from "../lib/date";
import type { TextLine, ImportReport } from "./types";

// ---------- section classification ----------

type Category =
  | "header"
  | "summary"
  | "work"
  | "education"
  | "certifications"
  | "interests"
  | "skills"
  | "projects";

const SECTION_KEYWORDS: { cat: Category; words: string[] }[] = [
  { cat: "summary", words: ["summary", "professional summary", "profile", "objective", "about", "about me"] },
  {
    cat: "work",
    words: [
      "experience",
      "work experience",
      "professional experience",
      "employment",
      "employment history",
      "work history",
      "career history",
    ],
  },
  { cat: "education", words: ["education", "academic background"] },
  {
    cat: "certifications",
    words: ["certifications", "certification", "certificates", "licenses", "licenses & certifications"],
  },
  { cat: "interests", words: ["interests", "hobbies", "activities", "interests & hobbies"] },
  { cat: "skills", words: ["skills", "technical skills", "core competencies"] },
  { cat: "projects", words: ["projects", "personal projects", "selected projects"] },
];

function headingCategory(line: TextLine): Category | null {
  const norm = line.text.toLowerCase().replace(/[:•|]/g, "").trim();
  if (norm.length === 0 || norm.length > 40) return null;
  // Headings tend to be short and visually distinct (bold or all-caps).
  const looksHeading = line.bold || line.caps || norm.split(/\s+/).length <= 3;
  if (!looksHeading) return null;
  // Letter-spaced headings extract with gaps ("S U M M A RY"), so also compare
  // with all whitespace removed.
  const tight = norm.replace(/\s+/g, "");
  for (const { cat, words } of SECTION_KEYWORDS) {
    for (const w of words) {
      const wt = w.replace(/\s+/g, "");
      if (
        norm === w ||
        norm.startsWith(w + " ") ||
        norm === w + "s" ||
        tight === wt ||
        tight === wt + "s" ||
        tight.startsWith(wt)
      ) {
        return cat;
      }
    }
  }
  return null;
}

// ---------- contact extraction ----------

const RE_EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const RE_LINKEDIN = /linkedin\.com\/[^\s,|)]+/i;
const RE_GITHUB = /github\.com\/[^\s,|)]+/i;
const RE_URL = /\bhttps?:\/\/[^\s,|)]+|\b[a-z0-9-]+\.(?:com|net|io|dev|me|org|co)\b[^\s,|)]*/i;
const RE_LOCATION = /\b([A-Z][a-zA-Z.'-]+(?: [A-Z][a-zA-Z.'-]+)*),\s*([A-Z]{2})\b/;

function digitsCount(s: string): number {
  return (s.match(/\d/g) || []).length;
}

function extractContacts(lines: TextLine[], headerLines: TextLine[]): ContactItem[] {
  const found = new Map<string, string>(); // type -> raw value
  const allText = lines.map((l) => l.text);

  for (const text of allText) {
    if (!found.has("email")) {
      const m = text.match(RE_EMAIL);
      if (m) found.set("email", m[0]);
    }
    if (!found.has("linkedin")) {
      const m = text.match(RE_LINKEDIN);
      if (m) found.set("linkedin", m[0]);
    }
    if (!found.has("github")) {
      const m = text.match(RE_GITHUB);
      if (m) found.set("github", m[0]);
    }
    if (!found.has("phone")) {
      // a run of phone-ish characters with at least 10 digits
      const m = text.match(/\+?\d[\d\s().\-]{8,}\d/);
      if (m && digitsCount(m[0]) >= 10 && digitsCount(m[0]) <= 15) found.set("phone", m[0]);
    }
  }

  // Website: a URL that isn't part of an email / linkedin / github.
  for (const text of allText) {
    if (found.has("website")) break;
    const cleaned = text
      .replace(RE_EMAIL, " ")
      .replace(RE_LINKEDIN, " ")
      .replace(RE_GITHUB, " ");
    const m = cleaned.match(RE_URL);
    if (m && !/@/.test(m[0])) found.set("website", m[0]);
  }

  // Location: prefer the header block.
  for (const l of headerLines.length ? headerLines : lines) {
    const m = l.text.match(RE_LOCATION);
    if (m) {
      found.set("location", `${m[1]}, ${m[2]}`);
      break;
    }
  }

  const order: ContactItem["type"][] = [
    "email",
    "phone",
    "location",
    "linkedin",
    "github",
    "website",
  ];
  const contacts: ContactItem[] = [];
  for (const type of order) {
    const raw = found.get(type);
    if (!raw) continue;
    contacts.push({ id: uid(), type, value: formatContactValue(type, raw) });
  }
  return contacts;
}

function isContactLine(text: string): boolean {
  return (
    RE_EMAIL.test(text) ||
    RE_LINKEDIN.test(text) ||
    RE_GITHUB.test(text) ||
    /\+?\d[\d\s().\-]{8,}\d/.test(text) ||
    RE_URL.test(text)
  );
}

// ---------- text cleanup ----------

/**
 * Strip the leftovers of pulling a date/location out of a line: an empty
 * "()" when the parens held nothing but the date (e.g. "Acme Inc (2021)" →
 * "Acme Inc ()"), and dangling separator punctuation at either edge.
 */
function tidyText(s: string): string {
  return s
    .replace(/\(\s*\)/g, "")
    .replace(/^[\s,·|—–-]+/, "")
    .replace(/[\s,·|—–-]+$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ---------- dates ----------

const MONTH = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\\.?";
const SINGLE = `(?:${MONTH}\\s+)?(?:19|20)\\d{2}`;
const PRESENT = "present|current|ongoing|now";
const RE_RANGE = new RegExp(`(${SINGLE})\\s*(?:–|—|-|to|until|\\u2013|\\u2014)\\s*(${SINGLE}|${PRESENT})`, "i");
const RE_SINGLE = new RegExp(SINGLE, "i");
const RE_PRESENT = new RegExp(PRESENT, "i");

interface DateParse {
  matched: boolean;
  start: ResumeDate;
  end: ResumeDate;
  current: boolean;
  clean: string; // line text with the date portion removed
}

function parseDateRange(text: string): DateParse {
  const r = text.match(RE_RANGE);
  if (r) {
    const current = RE_PRESENT.test(r[2]);
    return {
      matched: true,
      start: parseLegacyDate(r[1]),
      end: current ? {} : parseLegacyDate(r[2]),
      current,
      clean: tidyText(text.replace(r[0], "")),
    };
  }
  const s = text.match(RE_SINGLE);
  if (s) {
    return {
      matched: true,
      start: parseLegacyDate(s[0]),
      end: {},
      current: false,
      clean: tidyText(text.replace(s[0], "")),
    };
  }
  return { matched: false, start: {}, end: {}, current: false, clean: text };
}

// ---------- entry splitting ----------

const BULLET_RE = /^\s*[•‣◦▪·●■*‒–-]\s+/;

function isBullet(text: string): boolean {
  return BULLET_RE.test(text);
}
function stripBullet(text: string): string {
  return text.replace(BULLET_RE, "").trim();
}

interface RawEntry {
  headerLines: string[];
  bullets: string[];
  start: ResumeDate;
  end: ResumeDate;
  current: boolean;
  gotDate: boolean;
}

function splitEntries(lines: TextLine[]): RawEntry[] {
  const entries: RawEntry[] = [];
  let cur: RawEntry | null = null;
  const newEntry = (): RawEntry => {
    const e: RawEntry = {
      headerLines: [],
      bullets: [],
      start: {},
      end: {},
      current: false,
      gotDate: false,
    };
    entries.push(e);
    return e;
  };

  for (const line of lines) {
    const text = line.text.trim();
    if (!text) continue;

    if (isBullet(text)) {
      if (!cur) cur = newEntry();
      cur.bullets.push(stripBullet(text));
      continue;
    }

    const dp = parseDateRange(text);
    // Start a new entry when the previous one already has bullets, or when a
    // fresh date appears after we already captured one (date-per-line lists).
    if (cur && (cur.bullets.length > 0 || (dp.matched && cur.gotDate))) cur = null;
    if (!cur) cur = newEntry();

    if (dp.matched && !cur.gotDate) {
      cur.start = dp.start;
      cur.end = dp.end;
      cur.current = dp.current;
      cur.gotDate = true;
      if (dp.clean) cur.headerLines.push(dp.clean);
    } else {
      cur.headerLines.push(text);
    }
  }

  return entries.filter((e) => e.headerLines.length || e.bullets.length);
}

const SEPARATORS = /\s+(?:—|–|\||·|@|at)\s+|\s*,\s*/;

function splitTitleCompany(line: string): { a: string; b?: string } {
  const parts = line.split(SEPARATORS).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { a: parts[0], b: parts.slice(1).join(", ") };
  return { a: line.trim() };
}

/** Pull a "City, ST" out of header parts, keeping the rest of each line. */
function pluckLocation(parts: string[]): { location?: string; rest: string[] } {
  const rest: string[] = [];
  let location: string | undefined;
  for (const p of parts) {
    const m = p.match(RE_LOCATION);
    if (m && !location) {
      location = `${m[1]}, ${m[2]}`;
      const stripped = tidyText(p.replace(m[0], ""));
      if (stripped) rest.push(stripped);
    } else {
      rest.push(p);
    }
  }
  return { location, rest };
}

// Common job-title words — used to tell which of two unseparated header lines
// is the role vs. the employer when a template stacks them ("Acme Inc" above
// "Marketing Manager") instead of joining them on one line.
const TITLE_WORDS =
  /\b(manager|coordinator|director|specialist|associate|analyst|engineer|developer|designer|intern|lead|supervisor|representative|consultant|administrator|technician|assistant|officer|executive|strategist|architect|scientist|researcher|producer|editor|writer|recruiter|accountant|nurse|teacher|instructor|trainer|planner|advisor|agent|clerk|cashier)\b/i;

function toWork(raw: RawEntry): WorkExperience {
  const remote = raw.headerLines.some((l) => /\bremote\b/i.test(l));
  const { location, rest } = pluckLocation(raw.headerLines);
  let title = "";
  let company = "";
  if (rest.length >= 2) {
    // Two separate lines with no clear order cue — guess which one names the
    // role by checking for common title words, rather than assuming line 0
    // is always the title (some templates put the employer name first).
    const swap = !TITLE_WORDS.test(rest[0]) && TITLE_WORDS.test(rest[1]);
    title = swap ? rest[1] : rest[0];
    company = swap ? rest[0] : rest[1];
  } else if (rest.length === 1) {
    const { a, b } = splitTitleCompany(rest[0]);
    title = a;
    company = b ?? "";
  }
  if (remote) company = tidyText(company.replace(/\bremote\b/i, ""));
  return {
    id: uid(),
    title,
    company,
    location: remote ? "" : location ?? "",
    remote,
    startDate: raw.start,
    endDate: raw.end,
    current: raw.current,
    bullets: raw.bullets.length ? raw.bullets : [""],
  };
}

// Note: a trailing `\b` would fail right after an abbreviation's optional
// final period when followed by whitespace (both "." and " " are non-word
// chars, so no boundary exists there) — use a "not a letter" lookahead
// instead so "B.A. Communications" matches the full "B.A." abbreviation.
const DEGREE_RE =
  /\b(A\.?A\.?S\.?|B\.?B\.?A\.?|B\.?F\.?A\.?|M\.?B\.?A\.?|M\.?F\.?A\.?|Ph\.?D\.?|Ed\.?D\.?|LL\.?B\.?|LL\.?M\.?|A\.?A\.?|A\.?S\.?|B\.?A\.?|B\.?S\.?|M\.?A\.?|M\.?S\.?|J\.?D\.?|M\.?D\.?|Bachelor'?s?|Master'?s?|Associate'?s?|Doctor(?:ate)?|Diploma|Certificate)(?![A-Za-z])/i;
const SCHOOL_RE = /university|college|institute|school|academy/i;

function toEducation(raw: RawEntry): Education {
  const lines = [...raw.headerLines, ...raw.bullets];
  const { location, rest } = pluckLocation(raw.headerLines);

  // The school's name and the degree/field often share one comma-separated
  // line ("B.A. in Communications, Lakeview College") — split that line
  // instead of dumping the whole thing into `school`. When they're on
  // separate lines instead, each line already names just one of the two.
  const schoolHostLine = rest.find((l) => SCHOOL_RE.test(l));
  let schoolLine = schoolHostLine ?? rest[0] ?? "";
  let degreeText = "";
  if (schoolHostLine) {
    const segs = schoolHostLine.split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean);
    const schoolSeg = segs.find((s) => SCHOOL_RE.test(s)) ?? schoolHostLine;
    schoolLine = schoolSeg;
    degreeText = segs.filter((s) => s !== schoolSeg).join(", ");
  }
  if (!degreeText) {
    degreeText = lines.find((l) => l !== schoolHostLine && DEGREE_RE.test(l)) ?? "";
  }

  let degree = "";
  let fieldStr = "";
  if (degreeText) {
    const degreeClean = tidyText(degreeText.replace(/GPA[:\s]*[0-4]\.\d{1,2}/i, ""));
    const inSplit = degreeClean.split(/\s+in\s+/i).map((p) => p.trim()).filter(Boolean);
    if (inSplit.length >= 2) {
      degree = inSplit[0];
      fieldStr = inSplit.slice(1).join(" in ");
    } else {
      const m = degreeClean.match(DEGREE_RE);
      if (m) {
        degree = m[0];
        fieldStr = tidyText(degreeClean.slice(m.index! + m[0].length));
      } else {
        degree = degreeClean;
      }
    }
  }

  const gpaMatch = lines.join(" ").match(/GPA[:\s]*([0-4]\.\d{1,2})/i);
  return {
    id: uid(),
    school: tidyText(schoolLine),
    degree,
    field: fieldStr,
    location: location ?? "",
    startDate: raw.start,
    endDate: raw.end,
    gpa: gpaMatch ? gpaMatch[1] : "",
    details: [],
  };
}

function toCertification(text: string): Certification {
  const dateMatch = text.match(RE_SINGLE);
  const date = dateMatch ? parseLegacyDate(dateMatch[0]) : {};
  const withoutDate = dateMatch ? tidyText(text.replace(dateMatch[0], "")) : text;
  const parts = withoutDate.split(/\s+(?:—|–|\||·|-)\s+|\s*,\s*/).map((p) => p.trim()).filter(Boolean);
  return {
    id: uid(),
    name: parts[0] ?? withoutDate.trim(),
    issuer: parts[1] ?? "",
    date,
    credentialId: "",
  };
}

// ---------- main ----------

export function linesToResume(lines: TextLine[]): {
  resume: Resume;
  report: ImportReport;
} {
  const warnings: string[] = [];

  // Partition into sections.
  const sections: Record<Category, TextLine[]> = {
    header: [],
    summary: [],
    work: [],
    education: [],
    certifications: [],
    interests: [],
    skills: [],
    projects: [],
  };
  let current: Category = "header";
  for (const line of lines) {
    const cat = headingCategory(line);
    if (cat) {
      current = cat;
      continue; // don't include the heading text itself
    }
    sections[current].push(line);
  }

  const headerLines = sections.header;

  // Name = largest font in the header that isn't a contact; fallback to first.
  const nameCandidates = headerLines.filter((l) => !isContactLine(l.text) && !RE_LOCATION.test(l.text));
  let nameLine: TextLine | undefined;
  for (const l of nameCandidates) {
    if (!nameLine || l.size > nameLine.size) nameLine = l;
  }
  if (!nameLine) nameLine = nameCandidates[0] ?? headerLines[0];
  const name = nameLine?.text.trim() ?? "";

  // Headline = the next non-contact header line after the name (no @, short).
  let headline = "";
  if (nameLine) {
    const idx = headerLines.indexOf(nameLine);
    for (let i = idx + 1; i < headerLines.length; i++) {
      const t = headerLines[i].text.trim();
      if (!isContactLine(t) && !RE_LOCATION.test(t) && t.length <= 60 && t !== name) {
        headline = t;
        break;
      }
    }
  }

  const contacts = extractContacts(lines, headerLines);

  const summary = sections.summary
    .map((l) => stripBullet(l.text))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const workRaw = splitEntries(sections.work);
  const work = workRaw.map(toWork);
  const educationRaw = splitEntries(sections.education);
  const education = educationRaw.map(toEducation);
  const certifications = sections.certifications
    .map((l) => stripBullet(l.text))
    .filter((t) => t.trim().length > 1)
    .map(toCertification);

  const interestsText = sections.interests
    .map((l) => stripBullet(l.text))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  // Warnings.
  if (!name) warnings.push("Couldn't confidently detect a name — check the Header.");
  const undated = workRaw.filter((e) => !e.gotDate).length;
  if (undated > 0)
    warnings.push(`Couldn't detect dates for ${undated} role${undated > 1 ? "s" : ""} — add them in the editor.`);
  for (const cat of ["skills", "projects"] as const) {
    if (sections[cat].length > 0)
      warnings.push(
        `A "${cat}" section was found but FormatMe has no matching field — re-add that content manually.`,
      );
  }

  const resume: Resume = {
    name,
    headline,
    summary,
    contacts,
    work,
    education,
    certifications,
    footer: {
      enabled: interestsText.length > 0,
      title: "Interests",
      entries: interestsText
        ? [
            {
              id: uid(),
              header: "",
              subheader: "",
              showDate: false,
              startDate: {},
              endDate: {},
              bullets: [interestsText],
            },
          ]
        : [],
    },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    meta: {
      templateId: "classic",
      fontId: "times",
      accentColor: "#B07C4E",
      pageSize: "LETTER",
      ...LAYOUT_DEFAULTS,
    },
  };

  const report: ImportReport = {
    name: name || undefined,
    counts: {
      contacts: contacts.length,
      work: work.length,
      education: education.length,
      certifications: certifications.length,
    },
    warnings,
  };

  return { resume, report };
}
