import { User, X } from "lucide-react";
import { useGlobalProfile } from "../../store/globalProfileStore";
import { useProfileModal } from "../../store/modalStore";
import { Field, Button } from "../common/ui";
import { ContactFieldsEditor } from "../editor/ContactFieldsEditor";

/**
 * Edits the global name/contacts that every resume uses unless it sets its own override.
 */
export function GlobalProfileModal() {
  const open = useProfileModal((s) => s.open);
  const setOpen = useProfileModal((s) => s.setOpen);
  const profile = useGlobalProfile((s) => s.profile);
  const setName = useGlobalProfile((s) => s.setName);
  const setHeadline = useGlobalProfile((s) => s.setHeadline);
  const addContact = useGlobalProfile((s) => s.addContact);
  const updateContact = useGlobalProfile((s) => s.updateContact);
  const removeContact = useGlobalProfile((s) => s.removeContact);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-soft animate-slide-up">
        <header className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
            <User size={16} />
          </span>
          <span className="flex-1 text-sm font-bold text-ink">Global profile</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-elevated hover:text-accent"
          >
            <X size={16} />
          </button>
        </header>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4 scroll-thin">
          <p className="text-xs text-muted">
            Applies to every resume that hasn't customized its own name & contacts.
          </p>
          <Field
            label="Full name"
            value={profile.name}
            placeholder="Jane Doe"
            onChange={(e) => setName(e.target.value)}
          />
          <Field
            label="Default job title"
            value={profile.headline ?? ""}
            placeholder="e.g. Senior Product Designer"
            onChange={(e) => setHeadline(e.target.value)}
          />
          <div>
            <span className="label">Contact details</span>
            <ContactFieldsEditor
              contacts={profile.contacts}
              onAdd={addContact}
              onUpdate={updateContact}
              onRemove={removeContact}
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-line px-5 py-3">
          <Button variant="primary" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
