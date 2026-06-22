import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Loader2 } from "lucide-react";
import type { Resume } from "../../types";
import { resumeToPdfBlob } from "../../export/pdf";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Renders the resume PDF onto canvases with pdf.js. This works in every
 * webview (WKWebView / WebView2 / WebKitGTK) — unlike an <iframe> PDF viewer,
 * which macOS WKWebView refuses to render inline.
 */
export function PdfCanvas({ resume }: { resume: Resume }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState(0);

  // Track the container width so the page reflows when the window/pane resizes
  // (and so the very first render uses a correct, settled measurement).
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth((w) => (Math.abs(w - el.clientWidth) > 8 ? el.clientWidth : w));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (width === 0) return;
    let cancelled = false;
    const renderTasks: pdfjs.RenderTask[] = [];
    let loadingTask: pdfjs.PDFDocumentLoadingTask | null = null;

    (async () => {
      try {
        setError(null);
        const blob = await resumeToPdfBlob(resume);
        if (cancelled) return;
        const data = new Uint8Array(await blob.arrayBuffer());
        loadingTask = pdfjs.getDocument({ data });
        const doc = await loadingTask.promise;
        if (cancelled) return;

        const container = containerRef.current;
        if (!container) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const targetWidth = Math.min(width - 32, 760);

        // Render into a detached fragment, then swap in to avoid flicker.
        const frag = document.createDocumentFragment();
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;
          const base = page.getViewport({ scale: 1 });
          const scale = targetWidth / base.width;
          const viewport = page.getViewport({ scale: scale * dpr });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / dpr}px`;
          canvas.style.height = `${viewport.height / dpr}px`;
          canvas.className =
            "mx-auto mb-5 rounded-sm bg-white shadow-[0_8px_30px_rgba(0,0,0,0.45)]";

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          const task = page.render({ canvas, canvasContext: ctx, viewport });
          renderTasks.push(task);
          await task.promise;
          if (cancelled) return;
          frag.appendChild(canvas);
        }

        if (cancelled) return;
        container.replaceChildren(frag);
        setLoading(false);
      } catch (e: unknown) {
        // Render cancellations throw — ignore those.
        if (!cancelled && !(e instanceof Error && e.name === "RenderingCancelledException")) {
          console.error("PDF preview error", e);
          setError(String(e));
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      renderTasks.forEach((t) => t.cancel());
      loadingTask?.destroy();
    };
  }, [resume, width]);

  return (
    <div className="relative h-full">
      {loading && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="animate-spin text-white/70" size={28} />
        </div>
      )}
      {error && (
        <div className="absolute inset-x-0 top-4 z-10 mx-auto w-fit rounded-lg bg-red-500/90 px-3 py-1.5 text-xs text-white">
          Preview error — check the console.
        </div>
      )}
      <div
        ref={containerRef}
        className="scroll-thin h-full overflow-y-auto px-4 py-5"
      />
    </div>
  );
}
