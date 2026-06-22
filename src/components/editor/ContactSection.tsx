import { useState } from "react";
import { AtSign, Plus, X, Eye, EyeOff } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { CONTACT_META, type ContactType } from "../../types";
import { formatContactValue } from "../../lib/format";
import { SectionCard, IconButton } from "../common/ui";

const TYPES: ContactType[] = [
  "phone",
  "email",
  "linkedin",
  "website",
  "github",
  "location",
  "custom",
];

export function ContactSection() {
  const contacts = useResume((s) => s.resume.contacts);
  const addContact = useResume((s) => s.addContact);
  const updateContact = useResume((s) => s.updateContact);
  const remove = useResume((s) => s.remove);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SectionCard
      title="Contact"
      subtitle="Toggle which details appear"
      icon={<AtSign size={18} />}
    >
      <div className="space-y-2">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <IconButton
              onClick={() => updateContact(c.id, { show: !c.show })}
              title={c.show ? "Shown on resume" : "Hidden"}
              className={c.show ? "text-accent" : ""}
            >
              {c.show ? <Eye size={15} /> : <EyeOff size={15} />}
            </IconButton>
            <span
              className={`w-20 shrink-0 text-xs font-semibold uppercase tracking-wide ${
                c.show ? "text-muted" : "text-muted/50"
              }`}
            >
              {c.type === "custom" ? "Custom" : CONTACT_META[c.type].label}
            </span>
            {c.type === "custom" && (
              <input
                className="field w-24 shrink-0"
                value={c.label ?? ""}
                placeholder="Label"
                onChange={(e) => updateContact(c.id, { label: e.target.value })}
              />
            )}
            <input
              className={`field flex-1 ${c.show ? "" : "opacity-60"}`}
              value={c.value}
              placeholder={CONTACT_META[c.type].placeholder}
              onChange={(e) => updateContact(c.id, { value: e.target.value })}
              onBlur={(e) =>
                updateContact(c.id, { value: formatContactValue(c.type, e.target.value) })
              }
            />
            <IconButton onClick={() => remove("contacts", c.id)} title="Remove">
              <X size={14} />
            </IconButton>
          </div>
        ))}
      </div>

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
                  addContact(t);
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
    </SectionCard>
  );
}
