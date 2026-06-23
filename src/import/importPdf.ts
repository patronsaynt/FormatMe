import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { extractLines } from "./pdfText";
import { linesToResume } from "./parseResume";
import type { Resume } from "../types";
import type { ImportReport } from "./types";

export interface ImportResult {
  /** null when nothing usable could be parsed (e.g. scanned PDF). */
  resume: Resume | null;
  report: ImportReport;
}

const EMPTY_COUNTS = { contacts: 0, work: 0, education: 0, certifications: 0 };

/**
 * Prompt for a PDF, extract its text, and parse it into a Resume.
 * Returns null if the user cancels the dialog.
 */
export async function importResumeFromPdf(): Promise<ImportResult | null> {
  const path = await open({
    multiple: false,
    filters: [{ name: "PDF Document", extensions: ["pdf"] }],
  });
  if (!path || typeof path !== "string") return null;

  const bytes = await invoke<number[]>("read_file_bytes", { path });
  const data = new Uint8Array(bytes);
  const lines = await extractLines(data);

  if (lines.length === 0) {
    return {
      resume: null,
      report: {
        counts: EMPTY_COUNTS,
        warnings: [
          "No selectable text was found. This looks like a scanned or image-only PDF, which FormatMe can't import (no OCR).",
        ],
      },
    };
  }

  return linesToResume(lines);
}
