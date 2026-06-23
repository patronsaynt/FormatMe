import { User } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { SectionCard, Field } from "../common/ui";

export function HeaderSection() {
  const resume = useResume((s) => s.resume);
  const setField = useResume((s) => s.setField);

  return (
    <SectionCard title="Header" subtitle="Name & title" icon={<User size={18} />}>
      <div className="space-y-3">
        <Field
          label="Full name"
          value={resume.name}
          placeholder="Jane Doe"
          onChange={(e) => setField("name", e.target.value)}
        />
        <Field
          label="Professional title (optional)"
          value={resume.headline ?? ""}
          placeholder="Senior Software Engineer"
          onChange={(e) => setField("headline", e.target.value)}
        />
      </div>
    </SectionCard>
  );
}
