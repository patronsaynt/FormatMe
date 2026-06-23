import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  TabStopType,
  TabStopPosition,
  BorderStyle,
} from "docx";
import type { Resume, SectionKey } from "../types";
import { footerItems, orderedSections } from "../types";
import { visibleContacts, dateRange, workLocation } from "../templates/shared";
import { formatResumeDate } from "../lib/date";
import { saveBytes, safeBaseName } from "./save";

const ACCENT = "B07C4E";

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 90 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 22,
        color: "333333",
        characterSpacing: 30,
      }),
    ],
  });
}

function rightTabbed(left: TextRun[], right: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [...left, new TextRun({ text: `\t${right}`, size: 18, color: "777777" })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 19 })],
  });
}

export async function exportDocx(resume: Resume): Promise<string | null> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: resume.name || "Your Name", bold: true, size: 44 })],
    }),
  );
  if (resume.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: resume.headline, size: 22, color: ACCENT, bold: true })],
      }),
    );
  }
  const contacts = visibleContacts(resume);
  if (contacts.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: contacts.map((c) => c.value).join("   •   "),
            size: 18,
            color: "444444",
          }),
        ],
      }),
    );
  }

  const writers: Record<SectionKey, () => void> = {
    summary: () => {
      if (!resume.summary?.trim()) return;
      children.push(sectionHeading("Summary"));
      children.push(
        new Paragraph({ children: [new TextRun({ text: resume.summary, size: 19 })] }),
      );
    },
    work: () => {
      if (!resume.work.length) return;
      children.push(sectionHeading("Experience"));
      for (const w of resume.work) {
        children.push(
          rightTabbed(
            [new TextRun({ text: w.title || "Role", bold: true, size: 21 })],
            dateRange(w.startDate, w.endDate, w.current),
          ),
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: [w.company, workLocation(w)].filter(Boolean).join("  ·  "),
                italics: true,
                size: 19,
                color: "333333",
              }),
            ],
          }),
        );
        for (const b of w.bullets.filter((x) => x.trim())) children.push(bullet(b));
      }
    },
    education: () => {
      if (!resume.education.length) return;
      children.push(sectionHeading("Education"));
      for (const e of resume.education) {
        children.push(
          rightTabbed(
            [new TextRun({ text: e.school || "School", bold: true, size: 21 })],
            dateRange(e.startDate, e.endDate),
          ),
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text:
                  [e.degree, e.field].filter(Boolean).join(", ") +
                  (e.gpa ? `  ·  GPA ${e.gpa}` : ""),
                italics: true,
                size: 19,
                color: "333333",
              }),
            ],
          }),
        );
      }
    },
    certifications: () => {
      if (!resume.certifications.length) return;
      children.push(sectionHeading("Certifications"));
      for (const c of resume.certifications) {
        children.push(
          rightTabbed(
            [new TextRun({ text: c.name + (c.issuer ? ` — ${c.issuer}` : ""), size: 19 })],
            formatResumeDate(c.date),
          ),
        );
      }
    },
    footer: () => {
      if (!(resume.footer.enabled && resume.footer.content.trim())) return;
      children.push(sectionHeading(resume.footer.title || "Interests"));
      if (resume.footer.style === "list") {
        for (const it of footerItems(resume.footer)) children.push(bullet(it));
      } else {
        children.push(
          new Paragraph({ children: [new TextRun({ text: resume.footer.content, size: 19 })] }),
        );
      }
    },
  };

  for (const k of orderedSections(resume)) writers[k]();

  const doc = new Document({
    styles: { default: { document: { run: { font: "Times New Roman" } } } },
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return saveBytes(bytes, {
    defaultName: `${safeBaseName(resume.name)}.docx`,
    filterName: "Word Document",
    extensions: ["docx"],
  });
}
