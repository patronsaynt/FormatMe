import type { Resume, SectionKey } from "../types";
import { footerItems, orderedSections } from "../types";
import { visibleContacts, dateRange, workLocation, certificationLabel } from "../templates/shared";
import { formatResumeDate } from "../lib/date";
import { getFont } from "../fonts/registry";
import { saveText, safeBaseName } from "./save";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function resumeToHtml(resume: Resume): string {
  const accent = resume.meta.accentColor;
  const font = getFont(resume.meta.fontId).cssStack;
  const contacts = visibleContacts(resume);

  const section = (title: string, body: string) =>
    body
      ? `<section><h2>${esc(title)}</h2>${body}</section>`
      : "";

  const work = resume.work
    .map(
      (w) => `
      <div class="entry">
        <div class="row"><span class="role">${esc(w.title || "Role")}</span>
          <span class="meta">${esc(dateRange(w.startDate, w.endDate, w.current))}</span></div>
        <div class="org">${esc([w.company, workLocation(w)].filter(Boolean).join("  ·  "))}</div>
        <ul>${w.bullets
          .filter((b) => b.trim())
          .map((b) => `<li>${esc(b)}</li>`)
          .join("")}</ul>
      </div>`,
    )
    .join("");

  const edu = resume.education
    .map(
      (e) => `
      <div class="entry">
        <div class="row"><span class="role">${esc(e.school || "School")}</span>
          <span class="meta">${esc(dateRange(e.startDate, e.endDate))}</span></div>
        <div class="org">${esc(
          [e.degree, e.field].filter(Boolean).join(", ") + (e.gpa ? `  ·  GPA ${e.gpa}` : ""),
        )}</div>
      </div>`,
    )
    .join("");

  const certs = resume.certifications
    .map(
      (c) =>
        `<div class="row"><span>${esc(certificationLabel(c))}</span>
         <span class="meta">${esc(formatResumeDate(c.date))}</span></div>`,
    )
    .join("");

  const bodyByKey: Record<SectionKey, string> = {
    summary: resume.summary?.trim() ? section("Summary", `<p>${esc(resume.summary)}</p>`) : "",
    work: section("Experience", work),
    education: section("Education", edu),
    certifications: section("Certifications", certs),
    footer:
      resume.footer.enabled && resume.footer.content.trim()
        ? section(
            resume.footer.title || "Interests",
            resume.footer.style === "list"
              ? `<ul>${footerItems(resume.footer).map((it) => `<li>${esc(it)}</li>`).join("")}</ul>`
              : `<p>${esc(resume.footer.content)}</p>`,
          )
        : "",
  };
  const body = orderedSections(resume)
    .map((k) => bodyByKey[k])
    .join("\n  ");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(resume.name || "Resume")}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: ${font}; color: #1c1c1c; max-width: 760px; margin: 40px auto; padding: 0 28px; line-height: 1.45; }
  h1 { text-align: center; font-size: 30px; margin: 0; }
  .headline { text-align: center; color: ${accent}; font-weight: 700; margin: 4px 0 0; }
  .contacts { text-align: center; color: #444; font-size: 13px; margin: 8px 0 4px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1.2px; border-bottom: 1px solid ${accent}; padding-bottom: 4px; margin: 22px 0 8px; }
  .entry { margin-bottom: 12px; }
  .row { display: flex; justify-content: space-between; align-items: baseline; }
  .role { font-weight: 700; }
  .org { font-style: italic; color: #333; font-size: 14px; }
  .meta { color: #777; font-size: 13px; }
  ul { margin: 4px 0 0; padding-left: 18px; }
  li { font-size: 14px; margin: 2px 0; }
  section { page-break-inside: avoid; }
</style>
</head>
<body>
  <h1>${esc(resume.name || "Your Name")}</h1>
  ${resume.headline ? `<p class="headline">${esc(resume.headline)}</p>` : ""}
  ${contacts.length ? `<p class="contacts">${contacts.map((c) => esc(c.value)).join("  •  ")}</p>` : ""}
  ${body}
</body>
</html>`;
}

export async function exportHtml(resume: Resume): Promise<string | null> {
  return saveText(resumeToHtml(resume), {
    defaultName: `${safeBaseName(resume.name)}.html`,
    filterName: "HTML Document",
    extensions: ["html"],
  });
}
