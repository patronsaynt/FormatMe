import { Heart, Plus, Trash2 } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { SectionCard, Field, Toggle, IconButton, Button } from "../common/ui";
import { SortableList } from "../common/SortableList";
import { BulletEditor } from "./BulletEditor";
import { DateField } from "./DateField";

export function FooterSection() {
  const footer = useResume((s) => s.resume.footer);
  const setFooter = useResume((s) => s.setFooter);
  const addFooterEntry = useResume((s) => s.addFooterEntry);
  const updateFooterEntry = useResume((s) => s.updateFooterEntry);
  const removeFooterEntry = useResume((s) => s.removeFooterEntry);
  const reorderFooterEntries = useResume((s) => s.reorderFooterEntries);

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

        {footer.entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line py-7 text-center">
            <p className="text-sm text-muted">No items yet.</p>
            <Button onClick={addFooterEntry} className="mt-2" variant="primary">
              <Plus size={15} /> Add item
            </Button>
          </div>
        ) : (
          <SortableList
            items={footer.entries}
            onReorder={reorderFooterEntries}
            renderItem={(entry) => (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <Field
                    label="Header"
                    value={entry.header}
                    placeholder="e.g. Side Projects"
                    onChange={(e) => updateFooterEntry(entry.id, { header: e.target.value })}
                  />
                  <IconButton
                    onClick={() => removeFooterEntry(entry.id)}
                    title="Delete entry"
                    className="mt-5 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </div>
                <Field
                  label="Subheader (optional)"
                  value={entry.subheader ?? ""}
                  placeholder="e.g. Independent & open-source"
                  onChange={(e) => updateFooterEntry(entry.id, { subheader: e.target.value })}
                />
                <Toggle
                  checked={!!entry.showDate}
                  onChange={(v) => updateFooterEntry(entry.id, { showDate: v })}
                  label="Show dates"
                />
                {entry.showDate && (
                  <div className="grid grid-cols-2 gap-2">
                    <DateField
                      label="Start"
                      value={entry.startDate ?? {}}
                      onChange={(d) => updateFooterEntry(entry.id, { startDate: d })}
                    />
                    <DateField
                      label="End"
                      value={entry.endDate ?? {}}
                      onChange={(d) => updateFooterEntry(entry.id, { endDate: d })}
                    />
                  </div>
                )}
                <div>
                  <span className="label">Items</span>
                  <BulletEditor
                    bullets={entry.bullets}
                    onChange={(next) => updateFooterEntry(entry.id, { bullets: next })}
                    placeholder="e.g. Photography"
                    addLabel="Add item"
                  />
                </div>
              </div>
            )}
          />
        )}

        {footer.entries.length > 0 && (
          <Button onClick={addFooterEntry} className="mt-1" variant="soft">
            <Plus size={15} /> Add entry
          </Button>
        )}
      </div>
    </SectionCard>
  );
}
