import { FilePlus2 } from "lucide-react";

/** Shown in place of the editor/preview when the user has no resumes yet. */
export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-elevated text-accent">
        <FilePlus2 size={26} />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">No resumes yet</p>
        <p className="text-xs text-muted">Click + to get started</p>
      </div>
    </div>
  );
}
