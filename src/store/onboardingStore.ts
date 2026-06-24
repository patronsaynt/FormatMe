import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Evaluated once at module load, before any other FormatMe store has had a
 * chance to write its own persisted state this session. If the user already
 * has FormatMe data from a previous session, they're a returning user — they
 * shouldn't be interrupted by first-run onboarding.
 *
 * NOTE: this store must be imported before the other persisted stores (it is,
 * via App.tsx) so this check sees only state carried over from prior sessions.
 */
const RETURNING_USER = (() => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("formatme:") && key !== "formatme:onboarding") {
        return true;
      }
    }
  } catch {
    /* localStorage unavailable — treat as a fresh user */
  }
  return false;
})();

interface OnboardingState {
  /** Whether the first-run onboarding has been completed (or skipped for returning users). */
  completed: boolean;
  complete: () => void;
  /** Re-trigger onboarding (handy for testing / a future "redo setup" action). */
  reset: () => void;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: RETURNING_USER,
      complete: () => set({ completed: true }),
      reset: () => set({ completed: false }),
    }),
    { name: "formatme:onboarding" },
  ),
);
