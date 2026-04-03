"use client";

import PanelShell from "./PanelShell";
import { vision } from "@/data/personal";

export default function VisionPanel() {
  return (
    <PanelShell eyebrow="Future" title={vision.title}>
      <div className="space-y-4">
        {vision.paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-[var(--text-muted)] leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </PanelShell>
  );
}
