import { useState } from "react";
import type { Resume } from "../types";
import type { ImportReport } from "../import/types";
import { importResumeFromPdf } from "../import/importPdf";
import { importProject } from "../export/project";

/**
 * Shared PDF/JSON import logic for the top toolbar and the new-project
 * popover. Importing always hands the parsed Resume to `onResume` rather
 * than mutating anything itself — callers decide whether that means
 * creating a new project or something else.
 */
export function useResumeImport(onResume: (resume: Resume) => void) {
  const [busy, setBusy] = useState(false);
  const [importState, setImportState] = useState<{ report: ImportReport; imported: boolean } | null>(
    null,
  );

  const importFromPdf = async () => {
    try {
      setBusy(true);
      const res = await importResumeFromPdf();
      if (!res) return; // dialog cancelled
      if (res.resume) {
        onResume(res.resume);
        setImportState({ report: res.report, imported: true });
      } else {
        setImportState({ report: res.report, imported: false });
      }
    } catch (err) {
      console.error(err);
      alert(`Import failed: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const importFromJson = async () => {
    try {
      setBusy(true);
      const resume = await importProject();
      if (resume) onResume(resume);
    } catch (err) {
      console.error(err);
      alert(`Import failed: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  return { busy, importState, setImportState, importFromPdf, importFromJson };
}
