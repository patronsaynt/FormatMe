import type { Resume } from "../types";
import { LAYOUT_DEFAULTS } from "../types";
import { uid } from "./id";

/** A friendly starter document so the preview is never empty. */
export function makeSampleResume(): Resume {
  return {
    name: "Alex Morgan",
    headline: "Senior Product Designer",
    summary:
      "Product designer with 8+ years crafting intuitive, accessible interfaces for fast-growing teams. Bridges research, visual design, and front-end to ship polished products.",
    contacts: [
      { id: uid(), type: "email", value: "alex.morgan@email.com", show: true },
      { id: uid(), type: "phone", value: "(415) 555-0182", show: true },
      { id: uid(), type: "location", value: "San Francisco, CA", show: true },
      { id: uid(), type: "linkedin", value: "linkedin.com/in/alexmorgan", show: true },
      { id: uid(), type: "website", value: "alexmorgan.design", show: false },
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
        date: "2020",
        credentialId: "",
      },
    ],
    footer: {
      enabled: true,
      title: "Interests",
      content: "Typography, trail running, film photography, and specialty coffee.",
    },
    meta: {
      templateId: "classic",
      fontId: "times",
      accentColor: "#B07C4E",
      pageSize: "LETTER",
      ...LAYOUT_DEFAULTS,
    },
  };
}
