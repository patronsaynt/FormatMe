import type { Resume } from "../types";
import { visibleContacts, dateRange, workLocation } from "../templates/shared";
import { CONTACT_META } from "../types";
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

  if (resume.summary?.trim()) {
    heading("Summary");
    lines.push(resume.summary);
  }

  if (resume.work.length) {
    heading("Experience");
    for (const w of resume.work) {
      lines.push("");
      lines.push(`${w.title || "Role"}  (${dateRange(w.startDate, w.endDate, w.current)})`);
      lines.push([w.company, workLocation(w)].filter(Boolean).join(" · "));
      for (const b of w.bullets.filter((x) => x.trim())) lines.push(`  - ${b}`);
    }
  }

  if (resume.education.length) {
    heading("Education");
    for (const e of resume.education) {
      lines.push("");
      lines.push(`${e.school || "School"}  (${dateRange(e.startDate, e.endDate)})`);
      const d = [e.degree, e.field].filter(Boolean).join(", ") + (e.gpa ? ` · GPA ${e.gpa}` : "");
      if (d.trim()) lines.push(d);
    }
  }

  if (resume.certifications.length) {
    heading("Certifications");
    for (const c of resume.certifications) {
      lines.push(`- ${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${c.date ? ` (${c.date})` : ""}`);
    }
  }

  if (resume.footer.enabled && resume.footer.content.trim()) {
    heading(resume.footer.title || "Interests");
    lines.push(resume.footer.content);
  }

  return lines.join("\n") + "\n";
}

export async function exportTxt(resume: Resume): Promise<string | null> {
  return saveText(resumeToText(resume), {
    defaultName: `${safeBaseName(resume.name)}.txt`,
    filterName: "Plain Text",
    extensions: ["txt"],
  });
}
