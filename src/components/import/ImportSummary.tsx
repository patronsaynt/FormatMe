import { CheckCircle2, AlertTriangle, FileUp, X } from "lucide-react";
import type { ImportReport } from "../../import/types";
import { Button } from "../common/ui";

/**
 * Post-import summary: what was detected and what to double-check. Parsing is
 * best-effort, so this nudges the user to review the populated editor.
 */
export function ImportSummary({
  report,
  imported,
  onClose,
}: {
  report: ImportReport;
  imported: boolean;
  onClose: () => void;
}) {
  const rows: { label: string; n: number }[] = [
    { label: "Contacts", n: report.counts.contacts },
    { label: "Work entries", n: report.counts.work },
    { label: "Education", n: report.counts.education },
    { label: "Certifications", n: report.counts.certifications },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-soft animate-slide-up">
        <header className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
            <FileUp size={16} />
          </span>
          <span className="flex-1 text-sm font-bold text-ink">
            {imported ? "Resume imported" : "Couldn't import PDF"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-elevated hover:text-accent"
          >
            <X size={16} />
          </button>
        </header>

        <div className="px-5 py-4">
          {imported && (
            <>
              {report.name && (
                <p className="mb-3 text-sm text-ink">
                  Detected resume for <span className="font-semibold">{report.name}</span>.
                </p>
              )}
              <div className="mb-4 grid grid-cols-2 gap-2">
                {rows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between rounded-lg border border-line bg-panel/60 px-3 py-2"
                  >
                    <span className="text-xs text-muted">{r.label}</span>
                    <span className="text-sm font-bold text-ink tabular-nums">{r.n}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {report.warnings.length > 0 ? (
            <ul className="space-y-1.5">
              {report.warnings.map((w, i) => (
                <li key={i} className="flex gap-2 text-xs text-ink">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          ) : (
            imported && (
              <p className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 size={14} className="text-emerald-500" /> Review the editor and tweak
                anything the importer missed.
              </p>
            )
          )}

          {imported && (
            <p className="mt-3 text-[11px] text-muted">
              Importing pulls in text only — pick a template, font, and spacing to restyle it.
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">
          <Button variant="primary" onClick={onClose}>
            {imported ? "Start editing" : "OK"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
