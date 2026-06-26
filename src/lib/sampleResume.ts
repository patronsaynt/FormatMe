import type { Resume } from "../types";
import { LAYOUT_DEFAULTS, DEFAULT_SECTION_ORDER } from "../types";
import { uid } from "./id";

/** An empty starter document for a brand-new project. */
export function makeBlankResume(): Resume {
  return {
    name: "",
    headline: "",
    summary: "",
    contacts: [],
    work: [],
    education: [],
    certifications: [],
    footer: {
      enabled: false,
      title: "Interests",
      entries: [],
    },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    meta: {
      templateId: "classic",
      fontId: "times",
      accentColor: "#B07C4E",
      pageSize: "LETTER",
      ...LAYOUT_DEFAULTS,
    },
    identityOverride: false,
  };
}

/** Deep-clones a resume, regenerating every nested id so it's safe to use as a duplicate project. */
export function cloneResumeWithFreshIds(resume: Resume): Resume {
  return {
    ...resume,
    contacts: resume.contacts.map((c) => ({ ...c, id: uid() })),
    work: resume.work.map((w) => ({ ...w, id: uid(), bullets: [...w.bullets] })),
    education: resume.education.map((e) => ({ ...e, id: uid(), details: [...e.details] })),
    certifications: resume.certifications.map((c) => ({ ...c, id: uid() })),
    footer: {
      ...resume.footer,
      entries: resume.footer.entries.map((e) => ({ ...e, id: uid(), bullets: [...e.bullets] })),
    },
    sectionOrder: [...resume.sectionOrder],
    meta: { ...resume.meta },
  };
}

/** A friendly starter document so the preview is never empty. */
export function makeSampleResume(): Resume {
  return {
    name: "Alex Morgan",
    headline: "Senior Product Designer",
    summary:
      "Product designer with 8+ years crafting intuitive, accessible interfaces for fast-growing teams. Bridges research, visual design, and front-end to ship polished products.",
    contacts: [
      { id: uid(), type: "email", value: "alex.morgan@email.com" },
      { id: uid(), type: "phone", value: "(415) 555-0182" },
      { id: uid(), type: "location", value: "San Francisco, CA" },
      { id: uid(), type: "linkedin", value: "linkedin.com/in/alexmorgan" },
    ],
    work: [
      {
        id: uid(),
        title: "Senior Product Designer",
        company: "Northwind Labs",
        location: "San Francisco, CA",
        remote: false,
        startDate: { year: 2021, month: 1 },
        endDate: {},
        current: true,
        bullets: [
          "Led the redesign of the core dashboard, lifting weekly active users by 34%.",
          "Built and maintained the company design system adopted by 5 product teams.",
          "Mentored 3 junior designers and ran weekly critique sessions.",
        ],
      },
      {
        id: uid(),
        title: "Product Designer",
        company: "Brightside",
        location: "",
        remote: true,
        startDate: { year: 2018, month: 6 },
        endDate: { year: 2020, month: 12 },
        current: false,
        bullets: [
          "Designed onboarding flows that cut time-to-value from 9 to 3 days.",
          "Partnered with engineering to ship a component library in React.",
        ],
      },
    ],
    education: [
      {
        id: uid(),
        school: "University of Washington",
        degree: "B.A.",
        field: "Human-Computer Interaction",
        location: "Seattle, WA",
        startDate: { year: 2012, month: 9 },
        endDate: { year: 2016, month: 5 },
        gpa: "3.8",
        details: [],
      },
    ],
    certifications: [
      {
        id: uid(),
        name: "Nielsen Norman UX Certification",
        issuer: "NN/g",
        date: { year: 2020 },
        credentialId: "",
      },
    ],
    footer: {
      enabled: true,
      title: "Interests",
      entries: [
        {
          id: uid(),
          header: "Side Projects",
          subheader: "Independent & open-source",
          showDate: false,
          startDate: {},
          endDate: {},
          bullets: [
            "Maintain an open-source design-tokens library used by 200+ repos.",
            "Built a weekend app for tracking trail-running routes.",
          ],
        },
        {
          id: uid(),
          header: "",
          subheader: "",
          showDate: false,
          startDate: {},
          endDate: {},
          bullets: ["Typography, trail running, film photography, and specialty coffee."],
        },
      ],
    },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    meta: {
      templateId: "classic",
      fontId: "times",
      accentColor: "#B07C4E",
      pageSize: "LETTER",
      ...LAYOUT_DEFAULTS,
    },
  };
}
