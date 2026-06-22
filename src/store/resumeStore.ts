import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Resume,
  WorkExperience,
  Education,
  Certification,
  ContactItem,
  ContactType,
  ResumeMeta,
  ResumeFooter,
} from "../types";
import { CONTACT_META } from "../types";
import { uid } from "../lib/id";
import { makeSampleResume } from "../lib/sampleResume";
import { parseLegacyDate } from "../lib/date";

type ListKey = "work" | "education" | "certifications" | "contacts";

interface ResumeState {
  resume: Resume;

  // top-level scalar fields
  setField: <K extends keyof Resume>(key: K, value: Resume[K]) => void;
  setMeta: (patch: Partial<ResumeMeta>) => void;
  setFooter: (patch: Partial<ResumeFooter>) => void;

  // generic list ops
  reorder: (key: ListKey, from: number, to: number) => void;
  remove: (key: ListKey, id: string) => void;

  // typed adders / updaters
  addWork: () => void;
  updateWork: (id: string, patch: Partial<WorkExperience>) => void;
  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<Education>) => void;
  addCertification: () => void;
  updateCertification: (id: string, patch: Partial<Certification>) => void;
  addContact: (type: ContactType) => void;
  updateContact: (id: string, patch: Partial<ContactItem>) => void;

  // whole-document
  replaceResume: (r: Resume) => void;
  resetResume: () => void;
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export const useResume = create<ResumeState>()(
  persist(
    (set) => ({
      resume: makeSampleResume(),

      setField: (key, value) =>
        set((s) => ({ resume: { ...s.resume, [key]: value } })),

      setMeta: (patch) =>
        set((s) => ({ resume: { ...s.resume, meta: { ...s.resume.meta, ...patch } } })),

      setFooter: (patch) =>
        set((s) => ({
          resume: { ...s.resume, footer: { ...s.resume.footer, ...patch } },
        })),

      reorder: (key, from, to) =>
        set((s) => ({
          resume: { ...s.resume, [key]: move(s.resume[key] as Array<{ id: string }>, from, to) },
        })),

      remove: (key, id) =>
        set((s) => ({
          resume: {
            ...s.resume,
            [key]: (s.resume[key] as Array<{ id: string }>).filter((x) => x.id !== id),
          },
        })),

      addWork: () =>
        set((s) => ({
          resume: {
            ...s.resume,
            work: [
              ...s.resume.work,
              {
                id: uid(),
                title: "",
                company: "",
                location: "",
                remote: false,
                startDate: {},
                endDate: {},
                current: false,
                bullets: [""],
              },
            ],
          },
        })),

      updateWork: (id, patch) =>
        set((s) => ({
          resume: {
            ...s.resume,
            work: s.resume.work.map((w) => (w.id === id ? { ...w, ...patch } : w)),
          },
        })),

      addEducation: () =>
        set((s) => ({
          resume: {
            ...s.resume,
            education: [
              ...s.resume.education,
              {
                id: uid(),
                school: "",
                degree: "",
                field: "",
                location: "",
                startDate: {},
                endDate: {},
                gpa: "",
                details: [],
              },
            ],
          },
        })),

      updateEducation: (id, patch) =>
        set((s) => ({
          resume: {
            ...s.resume,
            education: s.resume.education.map((e) =>
              e.id === id ? { ...e, ...patch } : e,
            ),
          },
        })),

      addCertification: () =>
        set((s) => ({
          resume: {
            ...s.resume,
            certifications: [
              ...s.resume.certifications,
              { id: uid(), name: "", issuer: "", date: "", credentialId: "" },
            ],
          },
        })),

      updateCertification: (id, patch) =>
        set((s) => ({
          resume: {
            ...s.resume,
            certifications: s.resume.certifications.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          },
        })),

      addContact: (type) =>
        set((s) => ({
          resume: {
            ...s.resume,
            contacts: [
              ...s.resume.contacts,
              {
                id: uid(),
                type,
                value: "",
                label: type === "custom" ? CONTACT_META.custom.label : undefined,
                show: true,
              },
            ],
          },
        })),

      updateContact: (id, patch) =>
        set((s) => ({
          resume: {
            ...s.resume,
            contacts: s.resume.contacts.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          },
        })),

      replaceResume: (r) => set({ resume: r }),
      resetResume: () => set({ resume: makeSampleResume() }),
    }),
    {
      name: "formatme:resume",
      version: 2,
      // v1 stored start/end dates as free-text strings; v2 uses structured
      // ResumeDate objects. Best-effort parse the old strings on load.
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as { resume?: Resume };
        if (version < 2 && state?.resume) {
          const fix = (entries: Array<{ startDate: unknown; endDate: unknown }>) => {
            for (const e of entries) {
              if (typeof e.startDate === "string") e.startDate = parseLegacyDate(e.startDate);
              if (typeof e.endDate === "string") e.endDate = parseLegacyDate(e.endDate);
              if (e.endDate == null) e.endDate = {};
            }
          };
          fix((state.resume.work ?? []) as never);
          fix((state.resume.education ?? []) as never);
        }
        return state;
      },
    },
  ),
);
