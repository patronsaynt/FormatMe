import { Palette, Type as TypeIcon, Check, ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { useUI } from "../../store/uiStore";
import { LAYOUT_DEFAULTS } from "../../types";
import { TEMPLATES } from "../../templates/registry";
import { FONTS } from "../../fonts/registry";
import { SectionCard, Slider, Toggle } from "../common/ui";
import { Popover } from "../common/Popover";

const ACCENTS = ["#B07C4E", "#A8543B", "#3F6F5A", "#3C5A78", "#6B5B95", "#1c1c1c"];
const pct = (v: number) => `${Math.round(v * 100)}%`;

export function StyleSection() {
  const meta = useResume((s) => s.resume.meta);
  const setMeta = useResume((s) => s.setMeta);
  const showAdvanced = useUI((s) => s.showAdvanced);
  const setShowAdvanced = useUI((s) => s.setShowAdvanced);

  const activeTemplate = TEMPLATES.find((t) => t.id === meta.templateId)!;
  const activeFont = FONTS.find((f) => f.id === meta.fontId)!;

  const density = meta.density ?? LAYOUT_DEFAULTS.density;
  const fontScale = meta.fontScale ?? LAYOUT_DEFAULTS.fontScale;
  const lineHeight = meta.lineHeight ?? LAYOUT_DEFAULTS.lineHeight;
  const letterSpacing = meta.letterSpacing ?? LAYOUT_DEFAULTS.letterSpacing;

  return (
    <SectionCard
      title="Style"
      subtitle="Template, font & formatting"
      icon={<Palette size={18} />}
      defaultOpen={false}
    >
      <div className="space-y-4">
        {/* Template picker */}
        <div>
          <span className="label">Template</span>
          <Popover
            block
            align="left"
            width="w-64"
            trigger={(open) => (
              <span
                className={`field flex cursor-pointer items-center justify-between ${open ? "border-accent" : ""}`}
              >
                <span className="flex items-center gap-1.5">
                  <Palette size={14} /> {activeTemplate.label}
                </span>
                <ChevronDown size={13} className="opacity-60" />
              </span>
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
                      {t.id === meta.templateId ? (
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
        </div>

        {/* Font picker */}
        <div>
          <span className="label">Font</span>
          <Popover
            block
            align="left"
            width="w-56"
            trigger={(open) => (
              <span
                className={`field flex cursor-pointer items-center justify-between ${open ? "border-accent" : ""}`}
              >
                <span className="flex items-center gap-1.5">
                  <TypeIcon size={14} /> {activeFont.label}
                </span>
                <ChevronDown size={13} className="opacity-60" />
              </span>
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
                        {f.id === meta.fontId && <Check size={14} className="text-accent" />}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Popover>
        </div>

        {/* Accent color — Classic is intentionally all-black, so no accent there. */}
        {meta.templateId !== "classic" && (
          <div>
            <span className="label">Accent color</span>
            <div className="flex gap-1.5">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setMeta({ accentColor: c })}
                  className="h-7 w-7 rounded-full ring-offset-2 ring-offset-elevated transition hover:scale-110"
                  style={{
                    background: c,
                    boxShadow: c === meta.accentColor ? `0 0 0 2px ${c}` : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Page size */}
        <div>
          <span className="label">Page size</span>
          <div className="flex w-fit overflow-hidden rounded-lg border border-line text-xs">
            {(["LETTER", "A4"] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setMeta({ pageSize: sz })}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  meta.pageSize === sz ? "bg-accent text-white" : "text-muted hover:bg-elevated"
                }`}
              >
                {sz === "LETTER" ? "Letter" : "A4"}
              </button>
            ))}
          </div>
        </div>

        {/* Formatting */}
        <div className="border-t border-line/70 pt-4">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <SlidersHorizontal size={13} /> Formatting
          </div>
          <div className="space-y-4">
            <Slider
              label="Spacing density"
              value={density}
              min={0.8}
              max={1.3}
              step={0.05}
              onChange={(v) => setMeta({ density: v })}
              format={pct}
              leftHint="Compact"
              rightHint="Spacious"
            />
            <Slider
              label="Font size"
              value={fontScale}
              min={0.85}
              max={1.2}
              step={0.05}
              onChange={(v) => setMeta({ fontScale: v })}
              format={pct}
              leftHint="Smaller"
              rightHint="Larger"
            />

            <div className="flex items-center justify-between border-t border-line/70 pt-3">
              <div>
                <span className="text-sm font-semibold text-ink">Advanced</span>
                <p className="text-xs text-muted">Line height & letter spacing</p>
              </div>
              <Toggle checked={showAdvanced} onChange={setShowAdvanced} />
            </div>

            {showAdvanced && (
              <div className="space-y-4 animate-slide-up">
                <Slider
                  label="Line height"
                  value={lineHeight}
                  min={1.0}
                  max={1.9}
                  step={0.05}
                  onChange={(v) => setMeta({ lineHeight: v })}
                  format={(v) => v.toFixed(2)}
                  leftHint="Tight"
                  rightHint="Airy"
                />
                <Slider
                  label="Letter spacing"
                  value={letterSpacing}
                  min={-0.5}
                  max={2}
                  step={0.1}
                  onChange={(v) => setMeta({ letterSpacing: v })}
                  format={(v) => `${v.toFixed(1)} pt`}
                  leftHint="Tight"
                  rightHint="Wide"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setMeta({ ...LAYOUT_DEFAULTS })}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-accent"
            >
              <RotateCcw size={13} /> Reset formatting
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
