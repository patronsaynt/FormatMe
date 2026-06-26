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
  FooterEntry,
  GlobalProfile,
} from "../types";
import { CONTACT_META, DEFAULT_SECTION_ORDER, orderedSections } from "../types";
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
  addFooterEntry: () => void;
  updateFooterEntry: (id: string, patch: Partial<FooterEntry>) => void;
  removeFooterEntry: (id: string) => void;
  reorderFooterEntries: (from: number, to: number) => void;

  // generic list ops
  reorder: (key: ListKey, from: number, to: number) => void;
  remove: (key: ListKey, id: string) => void;

  // document section ordering
  reorderSections: (from: number, to: number) => void;

  // typed adders / updaters
  addWork: () => void;
  updateWork: (id: string, patch: Partial<WorkExperience>) => void;
  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<Education>) => void;
  addCertification: () => void;
  updateCertification: (id: string, patch: Partial<Certification>) => void;
  addContact: (type: ContactType) => void;
  updateContact: (id: string, patch: Partial<ContactItem>) => void;

  // identity (name + contacts) override toggle — seeds from the global profile when turned on
  setIdentityOverride: (on: boolean, seedFrom?: GlobalProfile) => void;

  // whole-document
  replaceResume: (r: Resume) => void;
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

      addFooterEntry: () =>
        set((s) => ({
          resume: {
            ...s.resume,
            footer: {
              ...s.resume.footer,
              entries: [
                ...s.resume.footer.entries,
                {
                  id: uid(),
                  header: "",
                  subheader: "",
                  showDate: false,
                  startDate: {},
                  endDate: {},
                  bullets: [""],
                },
              ],
            },
          },
        })),

      updateFooterEntry: (id, patch) =>
        set((s) => ({
          resume: {
            ...s.resume,
            footer: {
              ...s.resume.footer,
              entries: s.resume.footer.entries.map((e) =>
                e.id === id ? { ...e, ...patch } : e,
              ),
            },
          },
        })),

      removeFooterEntry: (id) =>
        set((s) => ({
          resume: {
            ...s.resume,
            footer: {
              ...s.resume.footer,
              entries: s.resume.footer.entries.filter((e) => e.id !== id),
            },
          },
        })),

      reorderFooterEntries: (from, to) =>
        set((s) => ({
          resume: {
            ...s.resume,
            footer: { ...s.resume.footer, entries: move(s.resume.footer.entries, from, to) },
          },
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

      reorderSections: (from, to) =>
        set((s) => ({
          resume: { ...s.resume, sectionOrder: move(orderedSections(s.resume), from, to) },
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
              { id: uid(), name: "", issuer: "", date: {}, credentialId: "" },
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

      setIdentityOverride: (on, seedFrom) =>
        set((s) => {
          // Only seed from the global profile the first time this resume is
          // customized — a resume with existing local data keeps it when
          // toggled back on, instead of clobbering it with global values again.
          const isBlank = !s.resume.name.trim() && s.resume.contacts.length === 0;
          const shouldSeed = on && seedFrom && isBlank;
          return {
            resume: {
              ...s.resume,
              identityOverride: on,
              ...(shouldSeed
                ? {
                    name: seedFrom.name,
                    contacts: seedFrom.contacts.map((c) => ({ ...c, id: uid() })),
                  }
                : {}),
            },
          };
        }),

      replaceResume: (r) => set({ resume: r }),
    }),
    {
      name: "formatme:resume",
      version: 4,
      // v1→v2: free-text dates → structured ResumeDate.
      // v2→v3: add sectionOrder + footer.style defaults.
      // v3→v4: footer.content/style (flat text) → footer.entries (grouped, like Education/Work).
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as { resume?: Resume };
        const r = state?.resume as Record<string, unknown> | undefined;
        if (version < 2 && r) {
          const fix = (entries: Array<{ startDate: unknown; endDate: unknown }>) => {
            for (const e of entries) {
              if (typeof e.startDate === "string") e.startDate = parseLegacyDate(e.startDate);
              if (typeof e.endDate === "string") e.endDate = parseLegacyDate(e.endDate);
              if (e.endDate == null) e.endDate = {};
            }
          };
          fix((r.work ?? []) as never);
          fix((r.education ?? []) as never);
          for (const c of (r.certifications ?? []) as Array<{ date: unknown }>) {
            if (typeof c.date === "string") c.date = parseLegacyDate(c.date);
            if (c.date == null) c.date = {};
          }
        }
        if (version < 3 && r) {
          if (!Array.isArray(r.sectionOrder) || r.sectionOrder.length === 0) {
            r.sectionOrder = [...DEFAULT_SECTION_ORDER];
          }
          const footer = r.footer as { style?: string } | undefined;
          if (footer && !footer.style) footer.style = "paragraph";
        }
        if (version < 4 && r) {
          const footer = r.footer as
            | { content?: string; style?: string; entries?: unknown }
            | undefined;
          if (footer && !Array.isArray(footer.entries)) {
            const items = (footer.content ?? "")
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            footer.entries = items.length
              ? [
                  {
                    id: uid(),
                    header: "",
                    subheader: "",
                    showDate: false,
                    startDate: {},
                    endDate: {},
                    bullets: items,
                  },
                ]
              : [];
            delete footer.content;
            delete footer.style;
          }
        }
        return state;
      },
    },
  ),
);
