import { useState } from "react";
import { Plus, Pencil, Trash2, FileText, User, Check, X } from "lucide-react";
import { useProjects } from "../../store/projectsStore";
import { useProfileModal } from "../../store/modalStore";
import { Popover } from "../common/Popover";
import { Field, IconButton } from "../common/ui";

export function Sidebar() {
  const projects = useProjects((s) => s.projects);
  const activeId = useProjects((s) => s.activeId);
  const switchProject = useProjects((s) => s.switchProject);
  const renameProject = useProjects((s) => s.renameProject);
  const deleteProject = useProjects((s) => s.deleteProject);
  const setProfileModalOpen = useProfileModal((s) => s.setOpen);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const commitEdit = () => {
    if (editingId) renameProject(editingId, editTitle);
    setEditingId(null);
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-panel/50">
      <div className="flex items-center justify-between px-3 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Projects
        </span>
        <NewProjectPopover />
      </div>

      <div className="scroll-thin min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
              p.id === activeId
                ? "bg-accent/15 text-accent"
                : "text-ink hover:bg-elevated"
            }`}
          >
            <FileText size={14} className="shrink-0 opacity-70" />
            {editingId === p.id ? (
              <>
                <input
                  autoFocus
                  className="field flex-1 px-1.5 py-0.5 text-sm"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <IconButton onClick={commitEdit} title="Save">
                  <Check size={13} />
                </IconButton>
                <IconButton onClick={() => setEditingId(null)} title="Cancel">
                  <X size={13} />
                </IconButton>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => switchProject(p.id)}
                  className="flex-1 truncate text-left"
                  title={p.title}
                >
                  {p.title}
                </button>
                <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <IconButton onClick={() => startEdit(p.id, p.title)} title="Rename">
                    <Pencil size={13} />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      if (confirm(`Delete "${p.title}"? This can't be undone.`)) {
                        deleteProject(p.id);
                      }
                    }}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </IconButton>
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-line p-2">
        <button
          type="button"
          onClick={() => setProfileModalOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted transition-colors hover:bg-elevated hover:text-accent"
        >
          <User size={15} />
          Edit Global Profile
        </button>
      </div>
    </aside>
  );
}

function NewProjectPopover() {
  const projects = useProjects((s) => s.projects);
  const activeId = useProjects((s) => s.activeId);
  const createProject = useProjects((s) => s.createProject);
  const [title, setTitle] = useState("");

  const activeTitle = projects.find((p) => p.id === activeId)?.title ?? "current project";

  return (
    <Popover
      align="left"
      width="w-64"
      trigger={(open) => (
        <span
          title="New project"
          className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${
            open ? "bg-elevated text-accent" : "text-muted hover:bg-elevated hover:text-accent"
          }`}
        >
          <Plus size={16} />
        </span>
      )}
    >
      {(close) => (
        <div className="p-3">
          <Field
            label="Title"
            value={title}
            placeholder="Untitled Resume"
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="mt-3 space-y-1.5">
            <button
              type="button"
              onClick={() => {
                createProject({ mode: "blank" }, title);
                setTitle("");
                close();
              }}
              className="w-full rounded-lg border border-line px-2.5 py-1.5 text-left text-sm text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Blank resume
            </button>
            {activeId && (
              <button
                type="button"
                onClick={() => {
                  createProject({ mode: "duplicate", fromId: activeId }, title);
                  setTitle("");
                  close();
                }}
                className="w-full rounded-lg border border-line px-2.5 py-1.5 text-left text-sm text-ink transition-colors hover:border-accent hover:text-accent"
              >
                Duplicate "{activeTitle}"
              </button>
            )}
          </div>
        </div>
      )}
    </Popover>
  );
}
