import { Briefcase, Plus, Trash2 } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { SectionCard, Field, Toggle, IconButton, Button } from "../common/ui";
import { SortableList } from "../common/SortableList";
import { BulletEditor } from "./BulletEditor";
import { DateField } from "./DateField";

export function WorkSection() {
  const work = useResume((s) => s.resume.work);
  const addWork = useResume((s) => s.addWork);
  const updateWork = useResume((s) => s.updateWork);
  const remove = useResume((s) => s.remove);
  const reorder = useResume((s) => s.reorder);

  return (
    <SectionCard
      title="Work Experience"
      subtitle={`${work.length} ${work.length === 1 ? "entry" : "entries"}`}
      icon={<Briefcase size={18} />}
    >
      {work.length === 0 ? (
        <Empty onAdd={addWork} label="work experience" />
      ) : (
        <SortableList
          items={work}
          onReorder={(f, t) => reorder("work", f, t)}
          renderItem={(w) => (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <Field
                  label="Job title"
                  value={w.title}
                  placeholder="Product Manager"
                  onChange={(e) => updateWork(w.id, { title: e.target.value })}
                />
                <IconButton
                  onClick={() => remove("work", w.id)}
                  title="Delete entry"
                  className="mt-5 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field
                  label="Company"
                  value={w.company}
                  placeholder="Acme Inc."
                  onChange={(e) => updateWork(w.id, { company: e.target.value })}
                />
                {w.remote ? (
                  <div>
                    <span className="label">Location</span>
                    <div className="field flex items-center text-muted">Remote</div>
                  </div>
                ) : (
                  <Field
                    label="Location"
                    value={w.location ?? ""}
                    placeholder="New York, NY"
                    onChange={(e) => updateWork(w.id, { location: e.target.value })}
                  />
                )}
              </div>
              <div className="flex items-center gap-5">
                <Toggle
                  checked={w.remote}
                  onChange={(v) => updateWork(w.id, { remote: v })}
                  label="Remote"
                />
                <Toggle
                  checked={w.current}
                  onChange={(v) => updateWork(w.id, { current: v })}
                  label="Current role"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DateField
                  label="Start"
                  value={w.startDate}
                  onChange={(d) => updateWork(w.id, { startDate: d })}
                />
                <DateField
                  label="End"
                  value={w.endDate}
                  disabled={w.current}
                  disabledLabel="Present"
                  onChange={(d) => updateWork(w.id, { endDate: d })}
                />
              </div>
              <div>
                <span className="label">Highlights</span>
                <BulletEditor
                  bullets={w.bullets}
                  onChange={(next) => updateWork(w.id, { bullets: next })}
                />
              </div>
            </div>
          )}
        />
      )}

      {work.length > 0 && (
        <Button onClick={addWork} className="mt-3" variant="soft">
          <Plus size={15} /> Add experience
        </Button>
      )}
    </SectionCard>
  );
}

function Empty({ onAdd, label }: { onAdd: () => void; label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line py-7 text-center">
      <p className="text-sm text-muted">No {label} yet.</p>
      <Button onClick={onAdd} className="mt-2" variant="primary">
        <Plus size={15} /> Add {label}
      </Button>
    </div>
  );
}

export { Empty };
