import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Resume } from "../types";
import { uid } from "../lib/id";
import { useResume } from "./resumeStore";
import { useGlobalProfile } from "./globalProfileStore";
import { makeBlankResume, cloneResumeWithFreshIds } from "../lib/sampleResume";

export interface ProjectMeta {
  id: string;
  title: string;
  updatedAt: number;
  resume: Resume;
}

export type NewProjectOptions =
  | { mode: "blank" }
  | { mode: "duplicate"; fromId: string }
  | { mode: "resume"; resume: Resume };

interface ProjectsState {
  projects: ProjectMeta[];
  activeId: string | null;
  switchProject: (id: string) => void;
  createProject: (opts: NewProjectOptions, title: string) => void;
  renameProject: (id: string, title: string) => void;
  deleteProject: (id: string) => void;
  touchActiveResume: (resume: Resume) => void;
}

/** Seed a single project from the existing single-resume data, so upgrading users see no change. */
function bootstrapProjects(): { projects: ProjectMeta[]; activeId: string } {
  const resume = useResume.getState().resume;
  const id = uid();
  return {
    projects: [{ id, title: resume.name.trim() || "My Resume", updatedAt: Date.now(), resume }],
    activeId: id,
  };
}

function snapshotActive(projects: ProjectMeta[], activeId: string | null): ProjectMeta[] {
  if (!activeId) return projects;
  const resume = useResume.getState().resume;
  return projects.map((p) => (p.id === activeId ? { ...p, resume, updatedAt: Date.now() } : p));
}

export const useProjects = create<ProjectsState>()(
  persist(
    (set, get) => ({
      ...bootstrapProjects(),

      switchProject: (id) => {
        const { projects, activeId } = get();
        if (id === activeId) return;
        const target = projects.find((p) => p.id === id);
        if (!target) return;
        set({ projects: snapshotActive(projects, activeId), activeId: id });
        useResume.getState().replaceResume(target.resume);
      },

      createProject: (opts, title) => {
        const { projects, activeId } = get();
        const source =
          opts.mode === "duplicate"
            ? projects.find((p) => p.id === opts.fromId)?.resume ?? useResume.getState().resume
            : opts.mode === "resume"
              ? opts.resume
              : null;
        let resume: Resume;
        if (source) {
          resume = cloneResumeWithFreshIds(source);
        } else {
          resume = makeBlankResume();
          // Seed a brand-new blank resume with the default job title from the profile.
          const defaultHeadline = useGlobalProfile.getState().profile.headline;
          if (defaultHeadline) resume.headline = defaultHeadline;
        }
        const id = uid();
        const newProject: ProjectMeta = {
          id,
          title: title.trim() || "Untitled Resume",
          updatedAt: Date.now(),
          resume,
        };
        set({
          projects: [...snapshotActive(projects, activeId), newProject],
          activeId: id,
        });
        useResume.getState().replaceResume(resume);
      },

      renameProject: (id, title) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, title: title.trim() || p.title } : p)),
        })),

      deleteProject: (id) => {
        const { projects, activeId } = get();
        const remaining = projects.filter((p) => p.id !== id);

        if (remaining.length === 0) {
          set({ projects: [], activeId: null });
          return;
        }

        if (id === activeId) {
          const next = remaining[0];
          set({ projects: remaining, activeId: next.id });
          useResume.getState().replaceResume(next.resume);
        } else {
          set({ projects: remaining });
        }
      },

      touchActiveResume: (resume) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === s.activeId ? { ...p, resume, updatedAt: Date.now() } : p)),
        })),
    }),
    { name: "formatme:projects" },
  ),
);

// Mirror every active-resume edit into its project entry, the same way the
// editor's keystrokes already persist directly via useResume's own middleware.
useResume.subscribe((state) => {
  useProjects.getState().touchActiveResume(state.resume);
});
