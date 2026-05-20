import { create } from "zustand";
import { newId } from "../utils/id";
import type { ToastMessage, ToastVariant } from "../types";

interface ToastState {
  toasts: ToastMessage[];
  push: (variant: ToastVariant, title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (variant, title, description) => {
    const id = newId("toast");
    set((s) => ({ toasts: [...s.toasts, { id, variant, title, description }] }));
    window.setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
