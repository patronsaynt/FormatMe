import type { Resume, SectionKey } from "../types";
import { visibleContacts, dateRange, workLocation } from "../templates/shared";
import { formatResumeDate } from "../lib/date";
import { CONTACT_META, footerItems, orderedSections } from "../types";
import { saveText, safeBaseName } from "./save";

export function resumeToText(resume: Resume): string {
  const lines: string[] = [];
  const rule = "=".repeat(64);

  lines.push(resume.name || "Your Name");
  if (resume.headline) lines.push(resume.headline);

  const contacts = visibleContacts(resume);
  if (contacts.length) {
    lines.push(
      contacts
        .map((c) => {
          const label = c.type === "custom" ? c.label || "Info" : CONTACT_META[c.type].label;
          return `${label}: ${c.value}`;
        })
        .join("  |  "),
    );
  }

  const heading = (t: string) => {
    lines.push("", rule, t.toUpperCase(), rule);
  };

  const writers: Record<SectionKey, () => void> = {
    summary: () => {
      if (!resume.summary?.trim()) return;
      heading("Summary");
      lines.push(resume.summary);
    },
    work: () => {
      if (!resume.work.length) return;
      heading("Experience");
      for (const w of resume.work) {
        lines.push("");
        lines.push(`${w.title || "Role"}  (${dateRange(w.startDate, w.endDate, w.current)})`);
        lines.push([w.company, workLocation(w)].filter(Boolean).join(" · "));
        for (const b of w.bullets.filter((x) => x.trim())) lines.push(`  - ${b}`);
      }
    },
    education: () => {
      if (!resume.education.length) return;
      heading("Education");
      for (const e of resume.education) {
        lines.push("");
        lines.push(`${e.school || "School"}  (${dateRange(e.startDate, e.endDate)})`);
        const d = [e.degree, e.field].filter(Boolean).join(", ") + (e.gpa ? ` · GPA ${e.gpa}` : "");
        if (d.trim()) lines.push(d);
      }
    },
    certifications: () => {
      if (!resume.certifications.length) return;
      heading("Certifications");
      for (const c of resume.certifications) {
        lines.push(
          `- ${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${
            formatResumeDate(c.date) ? ` (${formatResumeDate(c.date)})` : ""
          }`,
        );
      }
    },
    footer: () => {
      if (!(resume.footer.enabled && resume.footer.content.trim())) return;
      heading(resume.footer.title || "Interests");
      if (resume.footer.style === "list") {
        for (const it of footerItems(resume.footer)) lines.push(`- ${it}`);
      } else {
        lines.push(resume.footer.content);
      }
    },
  };

  for (const k of orderedSections(resume)) writers[k]();

  return lines.join("\n") + "\n";
}

export async function exportTxt(resume: Resume): Promise<string | null> {
  return saveText(resumeToText(resume), {
    defaultName: `${safeBaseName(resume.name)}.txt`,
    filterName: "Plain Text",
    extensions: ["txt"],
  });
}
