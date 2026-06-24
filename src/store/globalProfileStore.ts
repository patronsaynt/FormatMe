import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ContactItem, ContactType, GlobalProfile } from "../types";
import { CONTACT_META } from "../types";
import { uid } from "../lib/id";
import { useResume } from "./resumeStore";

interface GlobalProfileState {
  profile: GlobalProfile;
  setName: (name: string) => void;
  setHeadline: (headline: string) => void;
  /** Replace the whole profile at once — used when onboarding seeds the initial identity. */
  replaceProfile: (profile: GlobalProfile) => void;
  addContact: (type: ContactType) => void;
  updateContact: (id: string, patch: Partial<ContactItem>) => void;
  removeContact: (id: string) => void;
  reorderContacts: (from: number, to: number) => void;
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Seed the global profile from the existing single resume so upgrading users see no change. */
function initialProfile(): GlobalProfile {
  const resume = useResume.getState().resume;
  return {
    name: resume.name,
    headline: resume.headline,
    contacts: resume.contacts.map((c) => ({ ...c })),
  };
}

export const useGlobalProfile = create<GlobalProfileState>()(
  persist(
    (set) => ({
      profile: initialProfile(),

      setName: (name) => set((s) => ({ profile: { ...s.profile, name } })),

      setHeadline: (headline) => set((s) => ({ profile: { ...s.profile, headline } })),

      replaceProfile: (profile) => set({ profile }),

      addContact: (type) =>
        set((s) => ({
          profile: {
            ...s.profile,
            contacts: [
              ...s.profile.contacts,
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
          profile: {
            ...s.profile,
            contacts: s.profile.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          },
        })),

      removeContact: (id) =>
        set((s) => ({
          profile: { ...s.profile, contacts: s.profile.contacts.filter((c) => c.id !== id) },
        })),

      reorderContacts: (from, to) =>
        set((s) => ({ profile: { ...s.profile, contacts: move(s.profile.contacts, from, to) } })),
    }),
    { name: "formatme:profile" },
  ),
);
