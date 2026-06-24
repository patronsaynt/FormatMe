import { User, AtSign } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { useGlobalProfile } from "../../store/globalProfileStore";
import { useProfileModal } from "../../store/modalStore";
import { SectionCard, Field } from "../common/ui";
import { ContactFieldsEditor } from "./ContactFieldsEditor";
import { IdentityOverrideToggle } from "./IdentityOverrideToggle";

export function HeaderSection() {
  const resume = useResume((s) => s.resume);
  const setField = useResume((s) => s.setField);
  const addContact = useResume((s) => s.addContact);
  const updateContact = useResume((s) => s.updateContact);
  const remove = useResume((s) => s.remove);
  const profile = useGlobalProfile((s) => s.profile);
  const setProfileModalOpen = useProfileModal((s) => s.setOpen);

  const override = resume.identityOverride ?? false;
  const name = override ? resume.name : profile.name;
  const contacts = override ? resume.contacts : profile.contacts;

  return (
    <SectionCard
      title="Header"
      subtitle="Name, title & contact info"
      icon={<User size={18} />}
      defaultOpen={false}
      right={<IdentityOverrideToggle />}
    >
      <div className="space-y-3">
        <Field
          label="Full name"
          value={name}
          placeholder="Jane Doe"
          disabled={!override}
          onChange={(e) => setField("name", e.target.value)}
        />
        <Field
          label="Professional title (optional)"
          value={resume.headline ?? ""}
          placeholder="Senior Software Engineer"
          onChange={(e) => setField("headline", e.target.value)}
        />

        {!override && (
          <p className="text-xs text-muted">
            Using your global profile name & contacts. {" "}
            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="font-medium text-accent hover:underline"
            >
              Edit global profile
            </button>
          </p>
        )}

        <div className="border-t border-line/70 pt-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <AtSign size={13} /> Contact
          </div>
          <ContactFieldsEditor
            contacts={contacts}
            onAdd={override ? addContact : undefined}
            onUpdate={updateContact}
            onRemove={override ? (id) => remove("contacts", id) : undefined}
            readOnly={!override}
          />
        </div>
      </div>
    </SectionCard>
  );
}
