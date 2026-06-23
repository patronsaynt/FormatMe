import { Heart } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { SectionCard, Field, TextArea, Toggle } from "../common/ui";
import { BulletEditor } from "./BulletEditor";

export function FooterSection() {
  const footer = useResume((s) => s.resume.footer);
  const setFooter = useResume((s) => s.setFooter);
  const style = footer.style ?? "paragraph";

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

        {/* Paragraph vs itemized list */}
        <div>
          <span className="label">Layout</span>
          <div className="flex overflow-hidden rounded-lg border border-line text-xs">
            {(["paragraph", "list"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFooter({ style: s })}
                className={`flex-1 px-3 py-1.5 font-medium capitalize transition-colors ${
                  style === s ? "bg-accent text-white" : "text-muted hover:bg-elevated"
                }`}
              >
                {s === "list" ? "Itemized list" : "Paragraph"}
              </button>
            ))}
          </div>
        </div>

        {style === "list" ? (
          <div>
            <span className="label">Items</span>
            <BulletEditor
              // Split on newline WITHOUT trimming, so spaces type normally while
              // editing. Output rendering trims/filters via footerItems().
              bullets={footer.content ? footer.content.split("\n") : [""]}
              onChange={(items) => setFooter({ content: items.join("\n") })}
              placeholder="e.g. Photography"
              addLabel="Add item"
            />
          </div>
        ) : (
          <TextArea
            label="Content"
            rows={2}
            value={footer.content}
            placeholder="Photography, hiking, open-source contribution…"
            onChange={(e) => setFooter({ content: e.target.value })}
          />
        )}
      </div>
    </SectionCard>
  );
}
