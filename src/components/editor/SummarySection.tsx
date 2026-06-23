import { AlignLeft } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { SectionCard, TextArea } from "../common/ui";

export function SummarySection() {
  const summary = useResume((s) => s.resume.summary);
  const setField = useResume((s) => s.setField);

  return (
    <SectionCard
      title="Summary"
      subtitle="Professional summary (optional)"
      icon={<AlignLeft size={18} />}
    >
      <TextArea
        rows={3}
        value={summary ?? ""}
        placeholder="A short professional summary…"
        onChange={(e) => setField("summary", e.target.value)}
      />
    </SectionCard>
  );
}
