"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useRoomStore } from "@/hooks/useRoomStore";

interface PanelShellProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

export default function PanelShell({ eyebrow, title, children }: PanelShellProps) {
  const setPanel = useRoomStore((s) => s.setPanel);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="panel-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setPanel(null)}
      />

      {/* Panel */}
      <motion.div
        className="panel-container"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Close button */}
        <button className="panel-close" onClick={() => setPanel(null)}>
          ✕
        </button>

        <div className="panel-eyebrow">{eyebrow}</div>
        <h2 className="panel-title">{title}</h2>

        {children}
      </motion.div>
    </>
  );
}
