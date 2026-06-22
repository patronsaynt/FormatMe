import { Plus, X } from "lucide-react";
import { IconButton } from "../common/ui";

export function BulletEditor({
  bullets,
  onChange,
  placeholder = "Describe an achievement…",
  addLabel = "Add bullet",
}: {
  bullets: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const update = (i: number, v: string) =>
    onChange(bullets.map((b, idx) => (idx === i ? v : b)));
  const remove = (i: number) => onChange(bullets.filter((_, idx) => idx !== i));
  const add = () => onChange([...bullets, ""]);

  return (
    <div className="space-y-1.5">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <span className="mt-2 text-accent">•</span>
          <textarea
            className="field min-h-[34px] resize-none py-1.5 leading-snug"
            rows={1}
            value={b}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
          />
          <IconButton onClick={() => remove(i)} title="Remove" className="mt-1">
            <X size={14} />
          </IconButton>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="ml-4 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
      >
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}
