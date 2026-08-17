"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";
import { springSoft } from "@/lib/motion";

export function Toast({
  open,
  message,
  onClose,
  duration = 4200,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(t);
  }, [open, duration, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={springSoft}
          className="fixed bottom-20 left-1/2 z-[90] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-start gap-2.5 rounded-[12px] border border-border bg-surface px-4 py-3 shadow-[0_18px_44px_-16px_rgba(15,23,42,0.4)]"
        >
          <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-success" />
          <p className="text-[13px] font-medium leading-snug text-ink">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
