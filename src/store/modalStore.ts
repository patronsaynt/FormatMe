import { create } from "zustand";

interface ProfileModalState {
  open: boolean;
  setOpen: (v: boolean) => void;
}

/** Transient (not persisted) open state for the Global Profile modal — triggered from several places. */
export const useProfileModal = create<ProfileModalState>()((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
}));
