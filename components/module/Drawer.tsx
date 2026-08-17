"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { ease, springSoft } from "@/lib/motion";

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  actions,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex justify-end bg-ink/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: 40, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={springSoft}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-border bg-surface shadow-[0_24px_64px_-16px_rgba(15,23,42,0.35)]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
              <div className="min-w-0">
                {eyebrow && (
                  <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-ink-faint">
                    {eyebrow}
                  </p>
                )}
                <h2 className="truncate text-[17px] font-semibold tracking-tight text-ink">{title}</h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {actions}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="flex size-9 items-center justify-center rounded-[10px] text-ink-muted hover:bg-border-soft hover:text-ink"
                >
                  <X size={17} />
                </button>
              </div>
            </header>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease, delay: 0.05 }}
              className="flex-1 overflow-y-auto px-6 py-5"
            >
              {children}
            </motion.div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
