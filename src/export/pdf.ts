import { pdf } from "@react-pdf/renderer";
import type { Resume } from "../types";
import { renderResumeDocument } from "../templates/registry";
import { saveBytes, safeBaseName } from "./save";

/** Generate the resume PDF as a Blob (used by both preview-export and save). */
export async function resumeToPdfBlob(resume: Resume): Promise<Blob> {
  return pdf(renderResumeDocument(resume)).toBlob();
}

export async function exportPdf(resume: Resume): Promise<string | null> {
  const blob = await resumeToPdfBlob(resume);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return saveBytes(bytes, {
    defaultName: `${safeBaseName(resume.name)}.pdf`,
    filterName: "PDF Document",
    extensions: ["pdf"],
  });
}
