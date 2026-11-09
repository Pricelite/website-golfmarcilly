"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Native dialogs keep keyboard focus inside and restore it to the opening control.
export function AdminDialog({ children, label, wide = false, onClose }: { children: ReactNode; label: string; wide?: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); };
  }, []);
  return <dialog ref={ref} aria-label={label} onCancel={event => { event.preventDefault(); onClose(); }} className={`admin-dialog fixed inset-0 m-auto max-h-[94dvh] overflow-y-auto overscroll-contain rounded-3xl border border-emerald-950/15 bg-white text-emerald-950 shadow-2xl backdrop:bg-emerald-950/50 ${wide ? "w-[98vw] max-w-none p-2 sm:p-4" : "w-[calc(100%-1.5rem)] max-w-2xl p-5 sm:p-7"}`}>{children}</dialog>;
}
