/** One reconstructed line of text from a PDF, with layout hints. */
export interface TextLine {
  text: string;
  x: number; // left edge (PDF points)
  y: number; // global top→bottom position (page-offset applied)
  page: number;
  size: number; // font size (max item height on the line)
  bold: boolean;
  caps: boolean; // line is entirely uppercase letters
}

/** Summary of what the importer detected, shown to the user afterward. */
export interface ImportReport {
  name?: string;
  counts: {
    contacts: number;
    work: number;
    education: number;
    certifications: number;
  };
  warnings: string[];
}
