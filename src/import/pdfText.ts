import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { TextItem, TextStyle } from "pdfjs-dist/types/src/display/api";
import type { TextLine } from "./types";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface RawItem {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bold: boolean;
}

/**
 * Extract positioned text from a PDF and reconstruct it into ordered lines.
 * Items sharing a baseline (similar y) are merged left→right into one line;
 * lines are ordered top→bottom across all pages.
 */
export async function extractLines(data: Uint8Array): Promise<TextLine[]> {
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  const lines: TextLine[] = [];

  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const styles = content.styles as Record<string, TextStyle>;

      const items: RawItem[] = [];
      for (const it of content.items as TextItem[]) {
        if (!("str" in it) || !it.str) continue;
        const fam = styles[it.fontName]?.fontFamily ?? "";
        items.push({
          str: it.str,
          x: it.transform[4],
          y: it.transform[5],
          w: it.width,
          h: it.height || Math.abs(it.transform[3]) || 10,
          bold: /bold|black|semibold|heavy/i.test(fam),
        });
      }
      if (items.length === 0) continue;

      // Group items into lines by baseline (y), with a tolerance.
      items.sort((a, b) => b.y - a.y || a.x - b.x);
      const used = new Array(items.length).fill(false);
      for (let i = 0; i < items.length; i++) {
        if (used[i]) continue;
        const tol = Math.max(2, items[i].h * 0.6);
        const group = [items[i]];
        used[i] = true;
        for (let j = i + 1; j < items.length; j++) {
          if (used[j]) continue;
          if (Math.abs(items[j].y - items[i].y) <= tol) {
            group.push(items[j]);
            used[j] = true;
          }
        }
        group.sort((a, b) => a.x - b.x);
        lines.push(buildLine(group, p));
      }
    }
  } finally {
    loadingTask.destroy();
  }

  // Order top→bottom across pages.
  lines.sort((a, b) => a.page - b.page || b.y - a.y);
  return lines.filter((l) => l.text.trim().length > 0);
}

function buildLine(group: RawItem[], page: number): TextLine {
  let text = "";
  for (let k = 0; k < group.length; k++) {
    const cur = group[k];
    if (k > 0) {
      const prev = group[k - 1];
      const gap = cur.x - (prev.x + prev.w);
      const needsSpace =
        gap > cur.h * 0.25 && !text.endsWith(" ") && !cur.str.startsWith(" ");
      if (needsSpace) text += " ";
    }
    text += cur.str;
  }
  text = text.replace(/\s+/g, " ").trim();
  const size = Math.max(...group.map((g) => g.h));
  const bold = group.some((g) => g.bold);
  const letters = text.replace(/[^A-Za-z]/g, "");
  const caps = letters.length >= 2 && letters === letters.toUpperCase();
  return { text, x: Math.min(...group.map((g) => g.x)), y: group[0].y, page, size, bold, caps };
}
