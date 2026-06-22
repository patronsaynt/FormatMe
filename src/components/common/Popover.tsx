import { useEffect, useRef, useState, type ReactNode } from "react";

/** Lightweight click-to-open popover that closes on outside click / Escape. */
export function Popover({
  trigger,
  children,
  align = "right",
  width = "w-56",
  block = false,
}: {
  trigger: (open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  width?: string;
  /** Make the trigger a full-width block (for form fields). */
  block?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`relative ${block ? "w-full" : ""}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={block ? "block w-full text-left" : undefined}
      >
        {trigger(open)}
      </button>
      {open && (
        <div
          className={`absolute z-30 mt-2 ${width} ${
            align === "right" ? "right-0" : "left-0"
          } overflow-hidden rounded-xl border border-line bg-elevated shadow-soft animate-slide-up`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
