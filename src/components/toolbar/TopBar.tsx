import { useState } from "react";
import {
  Download,
  Moon,
  Sun,
  Check,
  ChevronDown,
  FolderOpen,
  FileUp,
  Save,
  Loader2,
  FileText,
} from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { useGlobalProfile } from "../../store/globalProfileStore";
import { useProjects } from "../../store/projectsStore";
import { useUI } from "../../store/uiStore";
import { effectiveResume } from "../../lib/identity";
import { Popover } from "../common/Popover";
import { Logo } from "../common/Logo";
import { exportPdf } from "../../export/pdf";
import { exportDocx } from "../../export/docx";
import { exportHtml } from "../../export/html";
import { exportTxt } from "../../export/txt";
import { exportProject } from "../../export/project";
import { ImportSummary } from "../import/ImportSummary";
import { useResumeImport } from "../../lib/useResumeImport";

export function TopBar() {
  const resume = useResume((s) => s.resume);
  const profile = useGlobalProfile((s) => s.profile);
  const exportResume = effectiveResume(resume, profile);
  const touchActiveResume = useProjects((s) => s.touchActiveResume);
  const createProject = useProjects((s) => s.createProject);
  const { theme, toggleTheme } = useUI();
  const [busy, setBusy] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const { busy: importBusy, importState, setImportState, importFromPdf, importFromJson } =
    useResumeImport((imported) => {
      createProject({ mode: "resume", resume: imported }, imported.name || "Imported Resume");
    });

  const handleSave = () => {
    touchActiveResume(resume);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1200);
  };

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

  return (
    <>
    <header className="relative z-50 flex items-center gap-2 border-b border-line bg-panel/80 px-4 py-2.5 backdrop-blur">
      {/* Brand */}
      <div className="mr-1 flex items-center gap-2">
        <Logo height={22} />
      </div>

      <div className="flex-1" />

      {/* Theme toggle */}
      <ToolbarButton onClick={toggleTheme} title="Toggle theme">
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </ToolbarButton>

      {/* Import menu — always opens the import into a new project */}
      <Popover
        trigger={(open) => (
          <ToolbarButton active={open} title="Import">
            {importBusy ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />}
            Import
            <ChevronDown size={13} className="opacity-60" />
          </ToolbarButton>
        )}
      >
        {(close) => (
          <div className="p-1.5 text-sm">
            <MenuRow
              icon={<FileUp size={15} />}
              label="Import from PDF…"
              onClick={() => {
                close();
                void importFromPdf();
              }}
            />
            <MenuRow
              icon={<FolderOpen size={15} />}
              label="Import resume file (.json)…"
              onClick={() => {
                close();
                void importFromJson();
              }}
            />
          </div>
        )}
      </Popover>

      {/* Save menu */}
      <Popover
        trigger={(open) => (
          <ToolbarButton active={open} title="Save">
            <Save size={15} />
            Save
            <ChevronDown size={13} className="opacity-60" />
          </ToolbarButton>
        )}
      >
        {(close) => (
          <div className="p-1.5 text-sm">
            <MenuRow
              icon={justSaved ? <Check size={15} className="text-green-600" /> : <Save size={15} />}
              label={justSaved ? "Saved!" : "Save"}
              onClick={() => {
                handleSave();
                setTimeout(close, 700);
              }}
            />
            <MenuRow
              icon={<Save size={15} />}
              label="Save as resume file (.json)"
              onClick={() => {
                close();
                run("project", () => exportProject(resume));
              }}
            />
          </div>
        )}
      </Popover>

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
                run("pdf", () => exportPdf(exportResume));
              }}
            />
            <MenuRow
              icon={<FileText size={15} className="text-blue-500" />}
              label="Word (.docx)"
              onClick={() => {
                close();
                run("docx", () => exportDocx(exportResume));
              }}
            />
            <MenuRow
              icon={<FileText size={15} className="text-orange-500" />}
              label="HTML page"
              onClick={() => {
                close();
                run("html", () => exportHtml(exportResume));
              }}
            />
            <MenuRow
              icon={<FileText size={15} className="text-muted" />}
              label="Plain text (.txt)"
              onClick={() => {
                close();
                run("txt", () => exportTxt(exportResume));
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
