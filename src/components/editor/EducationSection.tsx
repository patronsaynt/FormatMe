import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { SectionCard, Field, IconButton, Button } from "../common/ui";
import { SortableList } from "../common/SortableList";
import { BulletEditor } from "./BulletEditor";
import { DateField } from "./DateField";
import { Empty } from "./WorkSection";

export function EducationSection() {
  const education = useResume((s) => s.resume.education);
  const addEducation = useResume((s) => s.addEducation);
  const updateEducation = useResume((s) => s.updateEducation);
  const remove = useResume((s) => s.remove);
  const reorder = useResume((s) => s.reorder);

  return (
    <SectionCard
      title="Education"
      subtitle={`${education.length} ${education.length === 1 ? "entry" : "entries"}`}
      icon={<GraduationCap size={18} />}
    >
      {education.length === 0 ? (
        <Empty onAdd={addEducation} label="education" />
      ) : (
        <SortableList
          items={education}
          onReorder={(f, t) => reorder("education", f, t)}
          renderItem={(e) => (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <Field
                  label="School"
                  value={e.school}
                  placeholder="State University"
                  onChange={(ev) => updateEducation(e.id, { school: ev.target.value })}
                />
                <IconButton
                  onClick={() => remove("education", e.id)}
                  title="Delete entry"
                  className="mt-5 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field
                  label="Degree"
                  value={e.degree}
                  placeholder="B.S."
                  onChange={(ev) => updateEducation(e.id, { degree: ev.target.value })}
                />
                <Field
                  label="Field of study"
                  value={e.field ?? ""}
                  placeholder="Computer Science"
                  onChange={(ev) => updateEducation(e.id, { field: ev.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DateField
                  label="Start"
                  value={e.startDate}
                  onChange={(d) => updateEducation(e.id, { startDate: d })}
                />
                <DateField
                  label="End"
                  value={e.endDate}
                  onChange={(d) => updateEducation(e.id, { endDate: d })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field
                  label="GPA"
                  value={e.gpa ?? ""}
                  placeholder="3.8"
                  onChange={(ev) => updateEducation(e.id, { gpa: ev.target.value })}
                />
                <Field
                  label="Location"
                  value={e.location ?? ""}
                  placeholder="City, ST"
                  onChange={(ev) => updateEducation(e.id, { location: ev.target.value })}
                />
              </div>
              <div>
                <span className="label">Details (optional)</span>
                <BulletEditor
                  bullets={e.details}
                  onChange={(next) => updateEducation(e.id, { details: next })}
                  placeholder="Honors, coursework, activities…"
                  addLabel="Add detail"
                />
              </div>
            </div>
          )}
        />
      )}

      {education.length > 0 && (
        <Button onClick={addEducation} className="mt-3" variant="soft">
          <Plus size={15} /> Add education
        </Button>
      )}
    </SectionCard>
  );
}
