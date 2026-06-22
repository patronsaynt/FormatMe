import { Calendar, X } from "lucide-react";
import type { ResumeDate } from "../../types";
import {
  MONTHS,
  formatResumeDate,
  daysInMonth,
  yearOptions,
  parseLegacyDate,
  isEmptyDate,
} from "../../lib/date";
import { Popover } from "../common/Popover";
import { Toggle } from "../common/ui";

const YEARS = yearOptions();

/**
 * Compact month/year date picker (day optional), with a free-text fallback for
 * values like "Expected 2025". Edits a structured ResumeDate.
 */
export function DateField({
  label,
  value,
  onChange,
  disabled,
  disabledLabel,
}: {
  label: string;
  value: ResumeDate;
  onChange: (d: ResumeDate) => void;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const custom = typeof value.text === "string";
  const display = formatResumeDate(value);

  if (disabled) {
    return (
      <div>
        <span className="label">{label}</span>
        <div className="field flex items-center text-muted">{disabledLabel ?? "—"}</div>
      </div>
    );
  }

  const setPart = (patch: Partial<ResumeDate>) => onChange({ ...value, ...patch });

  return (
    <div>
      <span className="label">{label}</span>
      <Popover
        block
        align="left"
        width="w-64"
        trigger={(open) => (
          <span
            className={`field flex cursor-pointer items-center justify-between ${
              open ? "border-accent shadow-glow" : ""
            }`}
          >
            <span className={display ? "text-ink" : "text-muted/70"}>
              {display || "Select…"}
            </span>
            <Calendar size={14} className="text-muted" />
          </span>
        )}
      >
        {() => (
          <div className="space-y-3 p-3">
            {custom ? (
              <input
                autoFocus
                className="field"
                placeholder="e.g. Expected 2025"
                value={value.text ?? ""}
                onChange={(e) => onChange({ text: e.target.value })}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="field"
                    value={value.month ?? ""}
                    onChange={(e) =>
                      setPart({
                        month: e.target.value ? Number(e.target.value) : undefined,
                        day: e.target.value ? value.day : undefined,
                      })
                    }
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    className="field"
                    value={value.year ?? ""}
                    onChange={(e) =>
                      setPart({ year: e.target.value ? Number(e.target.value) : undefined })
                    }
                  >
                    <option value="">Year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {value.month ? (
                  value.day ? (
                    <div className="flex items-center gap-2">
                      <select
                        className="field flex-1"
                        value={value.day}
                        onChange={(e) => setPart({ day: Number(e.target.value) })}
                      >
                        {Array.from(
                          { length: daysInMonth(value.month, value.year) },
                          (_, i) => i + 1,
                        ).map((d) => (
                          <option key={d} value={d}>
                            Day {d}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="text-xs text-muted hover:text-accent"
                        onClick={() => setPart({ day: undefined })}
                      >
                        Remove day
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="text-xs font-medium text-accent hover:underline"
                      onClick={() => setPart({ day: 1 })}
                    >
                      + Add day
                    </button>
                  )
                ) : null}
              </>
            )}

            <div className="flex items-center justify-between border-t border-line/70 pt-2">
              <Toggle
                checked={custom}
                onChange={(v) =>
                  v ? onChange({ text: display }) : onChange(parseLegacyDate(value.text))
                }
                label="Custom text"
              />
              {!isEmptyDate(value) && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
                  onClick={() => onChange({})}
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>
        )}
      </Popover>
    </div>
  );
}
