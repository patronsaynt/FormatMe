import type { ComponentType } from "react";
import type { Resume } from "../types";
import Classic from "./Classic";
import Modern from "./Modern";
import TwoColumn from "./TwoColumn";

export interface TemplateDef {
  id: string;
  label: string;
  description: string;
  Component: ComponentType<{ resume: Resume }>;
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Centered header, traditional single column.",
    Component: Classic,
  },
  {
    id: "modern",
    label: "Modern",
    description: "Bold accent banner with clean spacing.",
    Component: Modern,
  },
  {
    id: "twocolumn",
    label: "Two-Column",
    description: "Sidebar for contact, education & extras.",
    Component: TwoColumn,
  },
];

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

/** Render the active template's <Document> for the given resume. */
export function renderResumeDocument(resume: Resume) {
  const { Component } = getTemplate(resume.meta.templateId);
  return <Component resume={resume} />;
}
