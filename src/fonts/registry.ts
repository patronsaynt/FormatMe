import { Font } from "@react-pdf/renderer";

// Bundled static TTFs (Vite resolves these to asset URLs).
import latoR from "./files/lato-v25-latin-regular.ttf";
import latoI from "./files/lato-v25-latin-italic.ttf";
import latoB from "./files/lato-v25-latin-700.ttf";
import latoBI from "./files/lato-v25-latin-700italic.ttf";

import garamondR from "./files/eb-garamond-v32-latin-regular.ttf";
import garamondI from "./files/eb-garamond-v32-latin-italic.ttf";
import garamondB from "./files/eb-garamond-v32-latin-700.ttf";
import garamondBI from "./files/eb-garamond-v32-latin-700italic.ttf";

import merriR from "./files/merriweather-v33-latin-regular.ttf";
import merriI from "./files/merriweather-v33-latin-italic.ttf";
import merriB from "./files/merriweather-v33-latin-700.ttf";
import merriBI from "./files/merriweather-v33-latin-700italic.ttf";

import loraR from "./files/lora-v37-latin-regular.ttf";
import loraI from "./files/lora-v37-latin-italic.ttf";
import loraB from "./files/lora-v37-latin-700.ttf";
import loraBI from "./files/lora-v37-latin-700italic.ttf";

import openR from "./files/open-sans-v44-latin-regular.ttf";
import openI from "./files/open-sans-v44-latin-italic.ttf";
import openB from "./files/open-sans-v44-latin-700.ttf";
import openBI from "./files/open-sans-v44-latin-700italic.ttf";

import montR from "./files/montserrat-v31-latin-regular.ttf";
import montI from "./files/montserrat-v31-latin-italic.ttf";
import montB from "./files/montserrat-v31-latin-700.ttf";
import montBI from "./files/montserrat-v31-latin-700italic.ttf";

import sourceR from "./files/source-sans-3-v19-latin-regular.ttf";
import sourceI from "./files/source-sans-3-v19-latin-italic.ttf";
import sourceB from "./files/source-sans-3-v19-latin-700.ttf";
import sourceBI from "./files/source-sans-3-v19-latin-700italic.ttf";

import robotoR from "./files/roboto-v51-latin-regular.ttf";
import robotoI from "./files/roboto-v51-latin-italic.ttf";
import robotoB from "./files/roboto-v51-latin-700.ttf";
import robotoBI from "./files/roboto-v51-latin-700italic.ttf";

export type FontCategory = "Serif" | "Sans-serif" | "Monospace";

export interface FontDef {
  id: string;
  label: string;
  /** family string used in react-pdf styles */
  family: string;
  category: FontCategory;
  /** CSS font stack for the on-chrome preview of the name (optional) */
  cssStack: string;
  builtin?: boolean;
}

type Face = { src: string; fontWeight?: number; fontStyle?: "italic" };

const FOUR = (r: string, i: string, b: string, bi: string): Face[] => [
  { src: r, fontWeight: 400 },
  { src: i, fontWeight: 400, fontStyle: "italic" },
  { src: b, fontWeight: 700 },
  { src: bi, fontWeight: 700, fontStyle: "italic" },
];

// Registration payloads for bundled families, keyed by family name.
const BUNDLED: Record<string, Face[]> = {
  Lato: FOUR(latoR, latoI, latoB, latoBI),
  "EB Garamond": FOUR(garamondR, garamondI, garamondB, garamondBI),
  Merriweather: FOUR(merriR, merriI, merriB, merriBI),
  Lora: FOUR(loraR, loraI, loraB, loraBI),
  "Open Sans": FOUR(openR, openI, openB, openBI),
  Montserrat: FOUR(montR, montI, montB, montBI),
  "Source Sans 3": FOUR(sourceR, sourceI, sourceB, sourceBI),
  Roboto: FOUR(robotoR, robotoI, robotoB, robotoBI),
};

// The font picker. Built-in PDF families (Times/Helvetica/Courier) need no
// registration and always work; bundled families are TTFs registered below.
export const FONTS: FontDef[] = [
  {
    id: "times",
    label: "Times New Roman",
    family: "Times-Roman",
    category: "Serif",
    cssStack: '"Times New Roman", Times, serif',
    builtin: true,
  },
  {
    id: "garamond",
    label: "EB Garamond",
    family: "EB Garamond",
    category: "Serif",
    cssStack: '"EB Garamond", Garamond, serif',
  },
  {
    id: "merriweather",
    label: "Merriweather",
    family: "Merriweather",
    category: "Serif",
    cssStack: "Merriweather, Georgia, serif",
  },
  {
    id: "lora",
    label: "Lora",
    family: "Lora",
    category: "Serif",
    cssStack: "Lora, Georgia, serif",
  },
  {
    id: "helvetica",
    label: "Helvetica",
    family: "Helvetica",
    category: "Sans-serif",
    cssStack: "Helvetica, Arial, sans-serif",
    builtin: true,
  },
  {
    id: "inter-open",
    label: "Open Sans",
    family: "Open Sans",
    category: "Sans-serif",
    cssStack: '"Open Sans", system-ui, sans-serif',
  },
  {
    id: "lato",
    label: "Lato",
    family: "Lato",
    category: "Sans-serif",
    cssStack: "Lato, system-ui, sans-serif",
  },
  {
    id: "montserrat",
    label: "Montserrat",
    family: "Montserrat",
    category: "Sans-serif",
    cssStack: "Montserrat, system-ui, sans-serif",
  },
  {
    id: "source-sans",
    label: "Source Sans 3",
    family: "Source Sans 3",
    category: "Sans-serif",
    cssStack: '"Source Sans 3", system-ui, sans-serif',
  },
  {
    id: "roboto",
    label: "Roboto",
    family: "Roboto",
    category: "Sans-serif",
    cssStack: "Roboto, system-ui, sans-serif",
  },
  {
    id: "courier",
    label: "Courier",
    family: "Courier",
    category: "Monospace",
    cssStack: '"Courier New", Courier, monospace',
    builtin: true,
  },
];

let registered = false;

/** Register all bundled TTF families with react-pdf. Idempotent. */
export function registerFonts(): void {
  if (registered) return;
  registered = true;
  // react-pdf word-break/hyphenation off → cleaner resume line breaks
  Font.registerHyphenationCallback((word) => [word]);
  for (const [family, fonts] of Object.entries(BUNDLED)) {
    Font.register({ family, fonts });
  }
}

export function getFont(id: string): FontDef {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}
