import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface UIState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  /** Whether the Formatting section's granular (Advanced) controls are shown. */
  showAdvanced: boolean;
  setShowAdvanced: (v: boolean) => void;
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      theme: systemPrefersDark() ? "dark" : "light",
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setTheme: (t) => set({ theme: t }),
      showAdvanced: false,
      setShowAdvanced: (v) => set({ showAdvanced: v }),
    }),
    { name: "formatme:ui" },
  ),
);

/** Apply the `.dark` class to <html> for Tailwind dark mode. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}
