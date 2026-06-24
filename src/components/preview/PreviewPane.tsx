import { useResume } from "../../store/resumeStore";
import { useGlobalProfile } from "../../store/globalProfileStore";
import { useDebounced } from "../../lib/useDebounced";
import { effectiveResume } from "../../lib/identity";
import { PdfCanvas } from "./PdfCanvas";

export function PreviewPane() {
  const resume = useResume((s) => s.resume);
  const profile = useGlobalProfile((s) => s.profile);
  // Debounce so typing doesn't trigger a PDF re-render on every keystroke.
  const debounced = useDebounced(effectiveResume(resume, profile), 400);

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: "rgb(var(--preview-bg))" }}
    >
      <div className="flex items-center justify-between px-5 py-2 text-xs text-ink/55">
        <span className="font-medium uppercase tracking-wider">Live Preview</span>
        <span className="rounded bg-ink/10 px-2 py-0.5 text-ink/70">
          {debounced.meta.pageSize === "LETTER" ? "US Letter" : "A4"}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <PdfCanvas resume={debounced} />
      </div>
    </div>
  );
}
