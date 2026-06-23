import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * A textarea that grows to fit its content on every render (not just while
 * typing), so values set from state/import expand instead of scrolling.
 */
export function AutoTextarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const border = el.offsetHeight - el.clientHeight; // top+bottom border (border-box)
    el.style.height = `${el.scrollHeight + border}px`;
  });
  return (
    <textarea
      ref={ref}
      rows={1}
      className={`field resize-none overflow-hidden ${className}`}
      {...props}
    />
  );
}

/** Up/down buttons to move an item within a list (click to reorder). */
export function ReorderArrows({
  index,
  count,
  onMove,
  className = "",
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  className?: string;
}) {
  const btn =
    "grid h-[18px] w-5 place-items-center rounded text-muted/60 transition-colors hover:bg-elevated hover:text-accent disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-muted/60";
  return (
    <div className={`flex flex-col ${className}`}>
      <button
        type="button"
        title="Move up"
        disabled={index <= 0}
        onClick={() => onMove(index, index - 1)}
        className={btn}
      >
        <ChevronUp size={14} />
      </button>
      <button
        type="button"
        title="Move down"
        disabled={index >= count - 1}
        onClick={() => onMove(index, index + 1)}
        className={btn}
      >
        <ChevronDown size={14} />
      </button>
    </div>
  );
}

export function Field({
  label,
  ...props
}: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <input className="field" {...props} />
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: { label?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <textarea className="field resize-none leading-relaxed" {...props} />
    </label>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  leftHint,
  rightHint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  leftHint?: string;
  rightHint?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="label mb-0">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-accent">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        className="fm-range w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      {(leftHint || rightHint) && (
        <div className="mt-0.5 flex justify-between text-[10px] text-muted">
          <span>{leftHint}</span>
          <span>{rightHint}</span>
        </div>
      )}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-sm"
    >
      <span
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
          checked ? "justify-end bg-accent" : "justify-start bg-line"
        }`}
      >
        <span className="h-4 w-4 rounded-full bg-white shadow" />
      </span>
      {label && <span className="text-ink">{label}</span>}
    </button>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "soft";
  className?: string;
  title?: string;
  type?: "button" | "submit";
};

export function Button({
  children,
  onClick,
  variant = "soft",
  className = "",
  title,
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all active:scale-[0.97] focus:outline-none";
  const styles = {
    primary: "bg-accent text-white shadow-soft hover:brightness-105",
    soft: "bg-elevated text-ink border border-line hover:border-accent hover:text-accent",
    ghost: "text-muted hover:text-accent hover:bg-elevated",
  }[variant];
  return (
    <button type="button" title={title} onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function IconButton({
  children,
  onClick,
  title,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-accent ${className}`}
    >
      {children}
    </button>
  );
}

/** Collapsible section card used for each editor group. */
export function SectionCard({
  title,
  icon,
  subtitle,
  defaultOpen = true,
  right,
  children,
}: {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  defaultOpen?: boolean;
  right?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-line bg-panel/70 shadow-soft animate-fade-in">
      <header className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2.5 text-left"
        >
          <span className="text-accent">{icon}</span>
          <span>
            <span className="block text-sm font-semibold text-ink">{title}</span>
            {subtitle && <span className="block text-xs text-muted">{subtitle}</span>}
          </span>
        </button>
        {right}
        <IconButton onClick={() => setOpen((o) => !o)} title={open ? "Collapse" : "Expand"}>
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </IconButton>
      </header>
      {open && <div className="border-t border-line/70 px-4 py-4">{children}</div>}
    </section>
  );
}
