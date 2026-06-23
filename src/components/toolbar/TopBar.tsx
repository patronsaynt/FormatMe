import { useState } from "react";
import {
  Palette,
  Type as TypeIcon,
  Download,
  Moon,
  Sun,
  Check,
  ChevronDown,
  FolderOpen,
  FileUp,
  Save,
  RotateCcw,
  Loader2,
  FileText,
} from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { useUI } from "../../store/uiStore";
import { TEMPLATES } from "../../templates/registry";
import { FONTS } from "../../fonts/registry";
import { Popover } from "../common/Popover";
import { Logo } from "../common/Logo";
import { exportPdf } from "../../export/pdf";
import { exportDocx } from "../../export/docx";
import { exportHtml } from "../../export/html";
import { exportTxt } from "../../export/txt";
import { exportProject, importProject } from "../../export/project";
import { importResumeFromPdf } from "../../import/importPdf";
import { ImportSummary } from "../import/ImportSummary";
import type { ImportReport } from "../../import/types";

const ACCENTS = ["#B07C4E", "#A8543B", "#3F6F5A", "#3C5A78", "#6B5B95", "#1c1c1c"];

export function TopBar() {
  const resume = useResume((s) => s.resume);
  const setMeta = useResume((s) => s.setMeta);
  const replaceResume = useResume((s) => s.replaceResume);
  const resetResume = useResume((s) => s.resetResume);
  const { theme, toggleTheme } = useUI();
  const [busy, setBusy] = useState<string | null>(null);
  const [importState, setImportState] = useState<{ report: ImportReport; imported: boolean } | null>(
    null,
  );

  const run = async (kind: string, fn: () => Promise<unknown>) => {
    try {
      setBusy(kind);
      await fn();
    } catch (err) {
      console.error(err);
      alert(`Export failed: ${String(err)}`);
    } finally {
      setBusy(null);
    }
  };

  const handleImportPdf = async () => {
    if (
      !confirm(
        "Importing a PDF replaces your current resume with its extracted text.\n\nTip: use Save project first if you want to keep a backup.",
      )
    )
      return;
    try {
      setBusy("import");
      const res = await importResumeFromPdf();
      if (!res) return; // dialog cancelled
      if (res.resume) {
        replaceResume(res.resume);
        setImportState({ report: res.report, imported: true });
      } else {
        setImportState({ report: res.report, imported: false });
      }
    } catch (err) {
      console.error(err);
      alert(`Import failed: ${String(err)}`);
    } finally {
      setBusy(null);
    }
  };

  const activeTemplate = TEMPLATES.find((t) => t.id === resume.meta.templateId)!;
  const activeFont = FONTS.find((f) => f.id === resume.meta.fontId)!;

  return (
    <>
    <header className="relative z-50 flex items-center gap-2 border-b border-line bg-panel/80 px-4 py-2.5 backdrop-blur">
      {/* Brand */}
      <div className="mr-1 flex items-center gap-2">
        <Logo height={22} />
      </div>

      <div className="mx-1 h-6 w-px bg-line" />

      {/* Template picker */}
      <Popover
        align="left"
        width="w-64"
        trigger={(open) => (
          <ToolbarButton active={open}>
            <Palette size={15} /> {activeTemplate.label}
            <ChevronDown size={13} className="opacity-60" />
          </ToolbarButton>
        )}
      >
        {(close) => (
          <div className="p-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setMeta({ templateId: t.id });
                  close();
                }}
                className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-panel"
              >
                <span className="mt-0.5">
                  {t.id === resume.meta.templateId ? (
                    <Check size={15} className="text-accent" />
                  ) : (
                    <span className="block h-[15px] w-[15px]" />
                  )}
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">{t.label}</span>
                  <span className="block text-xs text-muted">{t.description}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Popover>

      {/* Font picker */}
      <Popover
        align="left"
        width="w-56"
        trigger={(open) => (
          <ToolbarButton active={open}>
            <TypeIcon size={15} /> {activeFont.label}
            <ChevronDown size={13} className="opacity-60" />
          </ToolbarButton>
        )}
      >
        {(close) => (
          <div className="max-h-80 overflow-y-auto p-1.5 scroll-thin">
            {["Serif", "Sans-serif", "Monospace"].map((cat) => (
              <div key={cat}>
                <div className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {cat}
                </div>
                {FONTS.filter((f) => f.category === cat).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setMeta({ fontId: f.id });
                      close();
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left hover:bg-panel"
                    style={{ fontFamily: f.cssStack }}
                  >
                    <span className="text-sm text-ink">{f.label}</span>
                    {f.id === resume.meta.fontId && <Check size={14} className="text-accent" />}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </Popover>

      {/* Accent color — Classic is intentionally all-black, so no accent there. */}
      {resume.meta.templateId !== "classic" && (
        <Popover
          align="left"
          width="w-auto"
          trigger={(open) => (
            <ToolbarButton active={open} title="Accent color">
              <span
                className="h-4 w-4 rounded-full border border-white/40"
                style={{ background: resume.meta.accentColor }}
              />
            </ToolbarButton>
          )}
        >
          {(close) => (
            <div className="flex gap-1.5 p-2.5">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setMeta({ accentColor: c });
                    close();
                  }}
                  className="h-6 w-6 rounded-full ring-offset-2 ring-offset-elevated transition hover:scale-110"
                  style={{
                    background: c,
                    boxShadow: c === resume.meta.accentColor ? `0 0 0 2px ${c}` : undefined,
                  }}
                />
              ))}
            </div>
          )}
        </Popover>
      )}

      {/* Page size */}
      <div className="flex overflow-hidden rounded-lg border border-line text-xs">
        {(["LETTER", "A4"] as const).map((sz) => (
          <button
            key={sz}
            type="button"
            onClick={() => setMeta({ pageSize: sz })}
            className={`px-2.5 py-1.5 font-medium transition-colors ${
              resume.meta.pageSize === sz
                ? "bg-accent text-white"
                : "text-muted hover:bg-elevated"
            }`}
          >
            {sz === "LETTER" ? "Letter" : "A4"}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Import a PDF resume */}
      <ToolbarButton onClick={() => void handleImportPdf()} title="Import a PDF resume">
        {busy === "import" ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <FileUp size={15} />
        )}
        Import
      </ToolbarButton>

      {/* Project menu */}
      <Popover
        trigger={(open) => (
          <ToolbarButton active={open} title="Project">
            <Save size={15} />
          </ToolbarButton>
        )}
      >
        {(close) => (
          <div className="p-1.5 text-sm">
            <MenuRow
              icon={<Save size={15} />}
              label="Save project (.json)"
              onClick={() => {
                close();
                run("project", () => exportProject(resume));
              }}
            />
            <MenuRow
              icon={<FolderOpen size={15} />}
              label="Open project…"
              onClick={async () => {
                close();
                const r = await importProject();
                if (r) replaceResume(r);
              }}
            />
            <MenuRow
              icon={<RotateCcw size={15} />}
              label="Reset to sample"
              onClick={() => {
                close();
                if (confirm("Replace the current resume with the sample?")) resetResume();
              }}
            />
          </div>
        )}
      </Popover>

      {/* Theme toggle */}
      <ToolbarButton onClick={toggleTheme} title="Toggle theme">
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </ToolbarButton>

      {/* Export menu */}
      <Popover
        trigger={(open) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-semibold text-white shadow-soft transition hover:brightness-105 ${
              open ? "brightness-105" : ""
            }`}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Export
            <ChevronDown size={13} className="opacity-80" />
          </span>
        )}
      >
        {(close) => (
          <div className="p-1.5 text-sm">
            <MenuRow
              icon={<FileText size={15} className="text-red-500" />}
              label="PDF document"
              hint="Recommended"
              onClick={() => {
                close();
                run("pdf", () => exportPdf(resume));
              }}
            />
            <MenuRow
              icon={<FileText size={15} className="text-blue-500" />}
              label="Word (.docx)"
              onClick={() => {
                close();
                run("docx", () => exportDocx(resume));
              }}
            />
            <MenuRow
              icon={<FileText size={15} className="text-orange-500" />}
              label="HTML page"
              onClick={() => {
                close();
                run("html", () => exportHtml(resume));
              }}
            />
            <MenuRow
              icon={<FileText size={15} className="text-muted" />}
              label="Plain text (.txt)"
              onClick={() => {
                close();
                run("txt", () => exportTxt(resume));
              }}
            />
          </div>
        )}
      </Popover>
    </header>

    {importState && (
      <ImportSummary
        report={importState.report}
        imported={importState.imported}
        onClose={() => setImportState(null)}
      />
    )}
    </>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <span
      title={title}
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-accent bg-elevated text-accent"
          : "border-line text-ink hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </span>
  );
}

function MenuRow({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-ink hover:bg-panel"
    >
      {icon}
      <span className="flex-1">{label}</span>
      {hint && (
        <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
          {hint}
        </span>
      )}
    </button>
  );
}
