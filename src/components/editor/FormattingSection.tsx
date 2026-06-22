import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { useResume } from "../../store/resumeStore";
import { useUI } from "../../store/uiStore";
import { LAYOUT_DEFAULTS } from "../../types";
import { SectionCard, Slider, Toggle } from "../common/ui";

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function FormattingSection() {
  const meta = useResume((s) => s.resume.meta);
  const setMeta = useResume((s) => s.setMeta);
  const showAdvanced = useUI((s) => s.showAdvanced);
  const setShowAdvanced = useUI((s) => s.setShowAdvanced);

  const density = meta.density ?? LAYOUT_DEFAULTS.density;
  const fontScale = meta.fontScale ?? LAYOUT_DEFAULTS.fontScale;
  const lineHeight = meta.lineHeight ?? LAYOUT_DEFAULTS.lineHeight;
  const letterSpacing = meta.letterSpacing ?? LAYOUT_DEFAULTS.letterSpacing;

  return (
    <SectionCard
      title="Formatting"
      subtitle="Spacing, size & fine-tuning"
      icon={<SlidersHorizontal size={18} />}
      defaultOpen={false}
    >
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
    </SectionCard>
  );
}
