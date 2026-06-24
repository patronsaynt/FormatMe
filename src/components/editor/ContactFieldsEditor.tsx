import { useState } from "react";
import { Plus, X } from "lucide-react";
import { CONTACT_META, type ContactItem, type ContactType } from "../../types";
import { formatContactValue } from "../../lib/format";
import { IconButton } from "../common/ui";
import { CONTACT_ICONS } from "./contactIcons";

const TYPES: ContactType[] = [
  "phone",
  "email",
  "linkedin",
  "website",
  "github",
  "location",
  "custom",
];

/**
 * Renders an editable (or read-only) list of contact rows. Shared between the
 * per-resume ContactSection and the global profile editor so both stay visually
 * and behaviorally identical.
 */
export function ContactFieldsEditor({
  contacts,
  onAdd,
  onUpdate,
  onRemove,
  readOnly = false,
}: {
  contacts: ContactItem[];
  onAdd?: (type: ContactType) => void;
  onUpdate: (id: string, patch: Partial<ContactItem>) => void;
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <div className="space-y-2">
        {contacts.map((c) => {
          const Icon = CONTACT_ICONS[c.type];
          return (
            <div key={c.id} className="flex items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center text-muted">
                <Icon size={15} />
              </span>
              <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">
                {c.type === "custom" ? c.label || "Custom" : CONTACT_META[c.type].label}
              </span>
              {c.type === "custom" && !readOnly && (
                <input
                  className="field shrink-0"
                  style={{ width: "6rem" }}
                  value={c.label ?? ""}
                  placeholder="Label"
                  onChange={(e) => onUpdate(c.id, { label: e.target.value })}
                />
              )}
              <input
                className="field min-w-0 flex-1"
                value={c.value}
                placeholder={CONTACT_META[c.type].placeholder}
                disabled={readOnly}
                onChange={(e) => onUpdate(c.id, { value: e.target.value })}
                onBlur={(e) =>
                  onUpdate(c.id, { value: formatContactValue(c.type, e.target.value) })
                }
              />
              {!readOnly && onRemove && (
                <IconButton onClick={() => onRemove(c.id)} title="Remove">
                  <X size={14} />
                </IconButton>
              )}
            </div>
          );
        })}
        {contacts.length === 0 && (
          <p className="text-xs text-muted">No contact details yet.</p>
        )}
      </div>

      {!readOnly && onAdd && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            <Plus size={13} /> Add contact field
          </button>
          {menuOpen && (
            <div className="mt-2 flex flex-wrap gap-1.5 rounded-lg border border-line bg-elevated p-2 animate-fade-in">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onAdd(t);
                    setMenuOpen(false);
                  }}
                  className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:bg-accent hover:text-white"
                >
                  {t === "custom" ? "Custom…" : CONTACT_META[t].label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
