import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { ContactItem } from "../../types";
import { uid } from "../../lib/id";
import { useUI } from "../../store/uiStore";
import { useOnboarding } from "../../store/onboardingStore";
import { useGlobalProfile } from "../../store/globalProfileStore";
import { useResume } from "../../store/resumeStore";
import { Logo } from "../common/Logo";

const ACCENT_LIGHT = "176 124 78";
const ACCENT_DARK = "209 165 122";

const c = (ch: string) => `rgb(${ch})`;
const ca = (ch: string, a: number) => `rgb(${ch} / ${a})`;

/**
 * First-run onboarding — a flashy four-step flow (theme → profile → contact →
 * done) that seeds the global profile and chrome theme. Recreated pixel-for-pixel
 * from the Claude Design handoff (templates/onboarding/Onboarding.jsx).
 */
export function Onboarding() {
  const theme = useUI((s) => s.theme);
  const setTheme = useUI((s) => s.setTheme);
  const replaceProfile = useGlobalProfile((s) => s.replaceProfile);
  const complete = useOnboarding((s) => s.complete);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mounted, setMounted] = useState(false);
  const [nF, setNF] = useState(false);
  const [jF, setJF] = useState(false);
  const [eF, setEF] = useState(false);
  const [pF, setPF] = useState(false);

  const D = theme === "dark";
  const accent = D ? ACCENT_DARK : ACCENT_LIGHT;

  useEffect(() => {
    setMounted(true);
  }, []);

  const go = (n: number) => {
    if (n >= 0 && n <= 3) setStep(n);
  };
  const canNext =
    step === 0 || (step === 1 ? name.trim().length > 0 : email.trim().length > 0);

  /** Seed the global profile (and the starter resume's headline) from the collected answers. */
  const finish = () => {
    const contacts: ContactItem[] = [];
    if (email.trim()) contacts.push({ id: uid(), type: "email", value: email.trim() });
    if (phone.trim()) contacts.push({ id: uid(), type: "phone", value: phone.trim() });
    replaceProfile({
      name: name.trim(),
      headline: jobTitle.trim() || undefined,
      contacts,
    });
    if (jobTitle.trim()) useResume.getState().setField("headline", jobTitle.trim());
    complete();
  };

  // ── Step slide style ──────────────────────────────────────────
  const ss = (i: number): CSSProperties => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    opacity: step === i ? 1 : 0,
    transform: step === i ? "none" : step > i ? "translateX(-28px)" : "translateX(28px)",
    transition: "opacity 0.33s ease, transform 0.33s cubic-bezier(0.16,1,0.3,1)",
    pointerEvents: step === i ? "auto" : "none",
  });

  // ── Field style ───────────────────────────────────────────────
  const fs = (focused: boolean): CSSProperties => ({
    width: "100%",
    background: "rgb(var(--elevated))",
    border: `1.5px solid ${focused ? c(accent) : "rgb(var(--line))"}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 15,
    fontFamily: "var(--font-ui)",
    color: "rgb(var(--ink))",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: focused ? `0 0 0 3px ${ca(accent, 0.16)}` : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  });

  // ── Theme card style ──────────────────────────────────────────
  const tc = (t: "light" | "dark"): CSSProperties => {
    const sel = theme === t;
    return {
      flex: 1,
      borderRadius: 16,
      padding: 14,
      cursor: "pointer",
      background: t === "light" ? "#F5F0E8" : "#211D18",
      border: `2px solid ${sel ? c(accent) : t === "light" ? "#D6C8B2" : "#4A4135"}`,
      outline: "none",
      textAlign: "left",
      transform: sel ? "scale(1.03)" : "scale(1)",
      boxShadow: sel
        ? `0 0 0 1px ${ca(accent, 0.22)}, 0 8px 28px rgb(var(--shadow) / 0.2)`
        : "rgb(var(--shadow) / 0.1) 0 2px 8px",
      transition:
        "transform 0.22s cubic-bezier(0.16,1,0.3,1), border-color 0.2s, box-shadow 0.2s",
    };
  };

  // ── Indicator dot ─────────────────────────────────────────────
  const Dot = ({ t }: { t: "light" | "dark" }) => {
    const sel = theme === t;
    return (
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          flexShrink: 0,
          background: sel ? c(accent) : "transparent",
          border: `2px solid ${sel ? c(accent) : t === "light" ? "#D6C8B2" : "#4A4135"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        {sel && (
          <svg
            width="9"
            height="9"
            viewBox="0 0 12 12"
            fill="none"
            stroke={D ? "#211D18" : "white"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </div>
    );
  };

  const Label = ({ children }: { children: ReactNode }) => (
    <span
      style={{
        display: "block",
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "rgb(var(--muted))",
        marginBottom: 4,
      }}
    >
      {children}
    </span>
  );

  const OptLabel = ({ children }: { children: ReactNode }) => (
    <span
      style={{
        fontSize: 11,
        color: "rgb(var(--muted))",
        fontStyle: "italic",
        fontWeight: 400,
      }}
    >
      {children}
    </span>
  );

  // ── Mini preview card ─────────────────────────────────────────
  const MiniPreview = ({
    bg,
    sidebar,
    bars,
    paper,
  }: {
    bg: string;
    sidebar: string;
    bars: string;
    paper: "light" | "dark";
  }) => (
    <div
      style={{
        display: "flex",
        borderRadius: 10,
        overflow: "hidden",
        height: 82,
        background: bg,
        border: `1px solid ${bars}`,
      }}
    >
      <div
        style={{
          width: 26,
          background: sidebar,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          padding: "7px 5px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 5, background: bars, borderRadius: 2 }} />
        ))}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          padding: "8px 7px",
        }}
      >
        <div style={{ height: 5, background: bars, borderRadius: 2, width: "80%" }} />
        <div style={{ height: 5, background: bars, borderRadius: 2, width: "55%" }} />
        <div style={{ height: 5, background: sidebar, borderRadius: 2, width: "90%", marginTop: 4 }} />
        <div style={{ height: 5, background: sidebar, borderRadius: 2, width: "68%" }} />
      </div>
      <div
        style={{
          width: "40%",
          background: paper === "light" ? "#C9BAA4" : "#2A251F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 26,
            height: 36,
            background: paper === "light" ? "white" : "#FAF6EF",
            borderRadius: 2,
            boxShadow:
              paper === "light" ? "0 1px 4px rgba(0,0,0,0.14)" : "0 1px 6px rgba(0,0,0,0.5)",
          }}
        />
      </div>
    </div>
  );

  const StepTag = ({ children }: { children: ReactNode }) => (
    <p
      style={{
        margin: "0 0 4px",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: c(accent),
      }}
    >
      {children}
    </p>
  );

  const Heading = ({ children }: { children: ReactNode }) => (
    <h2
      style={{
        margin: "0 0 6px",
        fontSize: 26,
        fontWeight: 700,
        lineHeight: 1.2,
        color: "rgb(var(--ink))",
        fontFamily: "var(--font-garamond)",
      }}
    >
      {children}
    </h2>
  );

  const Desc = ({ children }: { children: ReactNode }) => (
    <p style={{ margin: 0, fontSize: 14, color: "rgb(var(--muted))", lineHeight: 1.5 }}>
      {children}
    </p>
  );

  const firstName = (name.split(" ")[0] || "").trim();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgb(var(--surface))",
        color: "rgb(var(--ink))",
        fontFamily: "var(--font-ui)",
        overflow: "hidden",
        transition: "background 0.4s ease, color 0.4s ease",
      }}
    >
      {/* Ambient blobs */}
      <div
        style={{
          position: "absolute",
          top: "-8%",
          right: "-6%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgb(var(--accent-soft) / 0.22)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "rgb(var(--accent-soft) / 0.17)",
          filter: "blur(110px)",
          pointerEvents: "none",
        }}
      />

      {/* Wrapper */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          position: "relative",
          zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(20px) scale(0.97)",
          transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Logo height={26} className="mx-auto" />
        </div>

        {/* Progress */}
        <div
          style={{
            height: 3,
            background: "rgb(var(--line))",
            borderRadius: 999,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              background: c(accent),
              borderRadius: 999,
              width: `${Math.round((step / 3) * 100)}%`,
              transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
          {["Theme", "Profile", "Contact"].map((l, i) => (
            <span
              key={l}
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: step >= i ? c(accent) : "rgb(var(--muted))",
                transition: "color 0.35s",
              }}
            >
              {l}
            </span>
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgb(var(--elevated))",
            border: "1px solid rgb(var(--line))",
            borderRadius: 24,
            padding: "28px 32px",
            boxShadow:
              "0 2px 10px rgb(var(--shadow) / 0.12), 0 18px 56px rgb(var(--shadow) / 0.12)",
            transition: "background 0.4s, border-color 0.4s",
          }}
        >
          {/* Steps */}
          <div style={{ position: "relative", minHeight: 310 }}>
            {/* Step 0: Theme */}
            <div style={ss(0)}>
              <StepTag>Step 1 of 3</StepTag>
              <Heading>How do you like your coffee?</Heading>
              <Desc>Pick a workspace theme — you can change it any time.</Desc>
              <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
                <button onClick={() => setTheme("light")} style={tc("light")}>
                  <MiniPreview bg="#F5F0E8" sidebar="#EDE4D3" bars="#D6C8B2" paper="light" />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginTop: 10,
                      justifyContent: "center",
                    }}
                  >
                    <Dot t="light" />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: theme === "light" ? c(accent) : "#827460",
                        transition: "color 0.2s",
                      }}
                    >
                      Light
                    </span>
                  </div>
                </button>
                <button onClick={() => setTheme("dark")} style={tc("dark")}>
                  <MiniPreview bg="#211D18" sidebar="#2B2620" bars="#4A4135" paper="dark" />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginTop: 10,
                      justifyContent: "center",
                    }}
                  >
                    <Dot t="dark" />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: theme === "dark" ? c(accent) : "#B0A28E",
                        transition: "color 0.2s",
                      }}
                    >
                      Dark
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 1: Profile */}
            <div style={ss(1)}>
              <StepTag>Step 2 of 3</StepTag>
              <Heading>Let's get to know you</Heading>
              <Desc>This gets added to your resumes automatically.</Desc>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22 }}
              >
                <label style={{ display: "block" }}>
                  <Label>Full Name</Label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setNF(true)}
                    onBlur={() => setNF(false)}
                    placeholder="e.g. Jane Smith"
                    style={fs(nF)}
                  />
                </label>
                <label style={{ display: "block" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 4 }}>
                    <Label>Job Title</Label>
                    <OptLabel>Optional</OptLabel>
                  </div>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    onFocus={() => setJF(true)}
                    onBlur={() => setJF(false)}
                    placeholder="e.g. Senior Product Designer"
                    style={fs(jF)}
                  />
                </label>
              </div>
            </div>

            {/* Step 2: Contact */}
            <div style={ss(2)}>
              <StepTag>Step 3 of 3</StepTag>
              <Heading>Your contact info</Heading>
              <Desc>Appears at the top of every resume you create.</Desc>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22 }}
              >
                <label style={{ display: "block" }}>
                  <Label>Email Address</Label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEF(true)}
                    onBlur={() => setEF(false)}
                    placeholder="jane@example.com"
                    style={fs(eF)}
                  />
                </label>
                <label style={{ display: "block" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 4 }}>
                    <Label>Phone Number</Label>
                    <OptLabel>Optional</OptLabel>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => setPF(true)}
                    onBlur={() => setPF(false)}
                    placeholder="e.g. +1 415 555 0123"
                    style={fs(pF)}
                  />
                </label>
              </div>
            </div>

            {/* Step 3: Done */}
            <div style={ss(3)}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: ca(D ? "90 74 56" : "222 199 168", 0.85),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: step === 3 ? "ob-ring 0.5s cubic-bezier(0.16,1,0.3,1)" : "none",
                  }}
                >
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={c(accent)}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <h2
                style={{
                  margin: "0 0 12px",
                  fontSize: 26,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: "rgb(var(--ink))",
                  fontFamily: "var(--font-garamond)",
                  textAlign: "center",
                }}
              >
                You're all set{firstName ? `, ${firstName}` : ""}!
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "rgb(var(--muted))",
                  lineHeight: 1.7,
                  textAlign: "center",
                }}
              >
                You can add more universal contact details for your resumes by clicking{" "}
                <strong style={{ color: c(accent), fontWeight: 600 }}>Edit Global Profile</strong>{" "}
                in the sidebar.
              </p>
              {name && (
                <div
                  style={{
                    margin: "20px auto 0",
                    width: 190,
                    background: "white",
                    borderRadius: 5,
                    padding: "12px 14px",
                    color: "#2c2c2c",
                    boxShadow: "0 4px 22px rgb(var(--shadow) / 0.2)",
                    fontFamily: "'EB Garamond',Garamond,serif",
                    lineHeight: 1.45,
                    animation: "ob-fade 0.4s 0.12s ease both",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: 7,
                      paddingBottom: 7,
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>{name}</div>
                    {jobTitle && (
                      <div style={{ fontSize: 9.5, fontWeight: 600, marginTop: 2 }}>{jobTitle}</div>
                    )}
                    {email && (
                      <div style={{ fontSize: 7.5, marginTop: 3, color: "#666" }}>{email}</div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 7,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 4,
                    }}
                  >
                    Experience
                  </div>
                  <div style={{ height: 4, background: "#EDE4D3", borderRadius: 2, width: "88%", marginBottom: 3 }} />
                  <div style={{ height: 4, background: "#EDE4D3", borderRadius: 2, width: "66%", marginBottom: 8 }} />
                  <div
                    style={{
                      fontSize: 7,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 4,
                    }}
                  >
                    Education
                  </div>
                  <div style={{ height: 4, background: "#EDE4D3", borderRadius: 2, width: "78%" }} />
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 24,
              borderTop: "1px solid rgb(var(--line))",
              paddingTop: 20,
            }}
          >
            <div style={{ minWidth: 88 }}>
              {step > 0 && (
                <button
                  onClick={() => go(step - 1)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "11px 14px",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    border: "none",
                    background: "transparent",
                    color: "rgb(var(--muted))",
                    cursor: "pointer",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  ← Back
                </button>
              )}
            </div>
            {step < 3 && (
              <button
                onClick={() => canNext && go(step + 1)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "11px 22px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  fontFamily: "var(--font-ui)",
                  color: "white",
                  background: canNext ? c(accent) : ca(accent, 0.45),
                  cursor: canNext ? "pointer" : "not-allowed",
                  boxShadow: canNext ? `0 4px 14px ${ca(accent, 0.38)}` : "none",
                  transition: "background 0.2s, box-shadow 0.2s",
                }}
              >
                {step === 2 ? "Finish" : "Continue"} →
              </button>
            )}
            {step === 3 && (
              <button
                onClick={finish}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 28px",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  border: "none",
                  background: c(accent),
                  color: "white",
                  cursor: "pointer",
                  fontFamily: "var(--font-ui)",
                  boxShadow: `0 4px 18px ${ca(accent, 0.42)}`,
                  animation: "ob-float 2.5s ease-in-out infinite",
                }}
              >
                Get started →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
