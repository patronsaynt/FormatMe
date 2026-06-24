import type { GlobalProfile, Resume } from "../types";

/** The name/contacts a resume should actually use — its own override, or the shared global profile. */
export function resolveIdentity(
  resume: Resume,
  profile: GlobalProfile,
): Pick<Resume, "name" | "contacts"> {
  return resume.identityOverride ? { name: resume.name, contacts: resume.contacts } : profile;
}

/** A resume with its effective name/contacts merged in, ready for preview or export. */
export function effectiveResume(resume: Resume, profile: GlobalProfile): Resume {
  return { ...resume, ...resolveIdentity(resume, profile) };
}
