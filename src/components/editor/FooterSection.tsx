import { Heart } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { SectionCard, Field, TextArea, Toggle } from "../common/ui";

export function FooterSection() {
  const footer = useResume((s) => s.resume.footer);
  const setFooter = useResume((s) => s.setFooter);

  return (
    <SectionCard
      title="Footer"
      subtitle="Hobbies, interests & extras (optional)"
      icon={<Heart size={18} />}
      defaultOpen={footer.enabled}
      right={
        <Toggle checked={footer.enabled} onChange={(v) => setFooter({ enabled: v })} />
      }
    >
      <div className={`space-y-3 ${footer.enabled ? "" : "pointer-events-none opacity-50"}`}>
        <Field
          label="Section title"
          value={footer.title}
          placeholder="Interests"
          onChange={(e) => setFooter({ title: e.target.value })}
        />
        <TextArea
          label="Content"
          rows={2}
          value={footer.content}
          placeholder="Photography, hiking, open-source contribution…"
          onChange={(e) => setFooter({ content: e.target.value })}
        />
      </div>
    </SectionCard>
  );
}
