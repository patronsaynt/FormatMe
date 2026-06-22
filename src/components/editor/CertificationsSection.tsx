import { Award, Plus, Trash2 } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { SectionCard, Field, IconButton, Button } from "../common/ui";
import { SortableList } from "../common/SortableList";

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
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <Field
                  label="Certification"
                  value={c.name}
                  placeholder="AWS Solutions Architect"
                  onChange={(e) => updateCertification(c.id, { name: e.target.value })}
                />
                <IconButton
                  onClick={() => remove("certifications", c.id)}
                  title="Delete"
                  className="mt-5 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Field
                  label="Issuer"
                  value={c.issuer ?? ""}
                  placeholder="Amazon"
                  onChange={(e) => updateCertification(c.id, { issuer: e.target.value })}
                />
                <Field
                  label="Date"
                  value={c.date ?? ""}
                  placeholder="2023"
                  onChange={(e) => updateCertification(c.id, { date: e.target.value })}
                />
                <Field
                  label="Credential ID"
                  value={c.credentialId ?? ""}
                  placeholder="ABC-123"
                  onChange={(e) => updateCertification(c.id, { credentialId: e.target.value })}
                />
              </div>
            </div>
          )}
        />
      )}
      <Button onClick={addCertification} className="mt-3" variant="soft">
        <Plus size={15} /> Add certification
      </Button>
    </SectionCard>
  );
}
