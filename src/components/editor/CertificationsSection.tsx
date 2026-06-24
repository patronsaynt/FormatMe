import { useState } from "react";
import { Award, Plus, Trash2 } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import type { Certification } from "../../types";
import { SectionCard, Field, IconButton, Button } from "../common/ui";
import { SortableList } from "../common/SortableList";
import { DateField } from "./DateField";

export function CertificationsSection() {
  const certs = useResume((s) => s.resume.certifications);
  const addCertification = useResume((s) => s.addCertification);
  const updateCertification = useResume((s) => s.updateCertification);
  const remove = useResume((s) => s.remove);
  const reorder = useResume((s) => s.reorder);

  return (
    <SectionCard
      title="Certifications"
      subtitle="Optional"
      icon={<Award size={18} />}
      defaultOpen={certs.length > 0}
    >
      {certs.length > 0 && (
        <SortableList
          items={certs}
          onReorder={(f, t) => reorder("certifications", f, t)}
          renderItem={(c) => (
            <CertificationRow
              cert={c}
              onUpdate={(patch) => updateCertification(c.id, patch)}
              onRemove={() => remove("certifications", c.id)}
            />
          )}
        />
      )}
      <Button onClick={addCertification} className="mt-3" variant="soft">
        <Plus size={15} /> Add certification
      </Button>
    </SectionCard>
  );
}

/** Its own component (not an inline render callback) so the credential-ID
 * reveal state stays local per certification, instead of one shared toggle. */
function CertificationRow({
  cert,
  onUpdate,
  onRemove,
}: {
  cert: Certification;
  onUpdate: (patch: Partial<Certification>) => void;
  onRemove: () => void;
}) {
  const [showCredentialId, setShowCredentialId] = useState(Boolean(cert.credentialId?.trim()));

  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <Field
          label="Certification"
          value={cert.name}
          placeholder="AWS Solutions Architect"
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        <IconButton onClick={onRemove} title="Delete" className="mt-5 hover:text-red-500">
          <Trash2 size={15} />
        </IconButton>
      </div>
      <div className={`grid gap-2 ${showCredentialId ? "grid-cols-3" : "grid-cols-2"}`}>
        <Field
          label="Issuer"
          value={cert.issuer ?? ""}
          placeholder="Amazon"
          onChange={(e) => onUpdate({ issuer: e.target.value })}
        />
        <DateField label="Date" value={cert.date} onChange={(d) => onUpdate({ date: d })} />
        {showCredentialId && (
          <Field
            label="Credential ID"
            value={cert.credentialId ?? ""}
            placeholder="ABC-123"
            onChange={(e) => onUpdate({ credentialId: e.target.value })}
          />
        )}
      </div>
      {!showCredentialId && (
        <button
          type="button"
          onClick={() => setShowCredentialId(true)}
          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          <Plus size={12} /> Add credential ID
        </button>
      )}
    </div>
  );
}
