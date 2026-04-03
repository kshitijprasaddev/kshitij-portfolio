"use client";

import { useState } from "react";
import PanelShell from "./PanelShell";
import { experience } from "@/data/experience";

export default function ExperiencePanel() {
  const [expanded, setExpanded] = useState<string | null>(experience[0].id);

  return (
    <PanelShell eyebrow="Background" title="Experience & Education">
      <p className="panel-subtitle">
        Professional work, research, and academic milestones.
      </p>

      <div className="space-y-3">
        {experience.map((entry) => {
          const isOpen = expanded === entry.id;
          return (
            <div key={entry.id} className="card">
              <button
                className="w-full text-left"
                onClick={() => setExpanded(isOpen ? null : entry.id)}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--primary)]">
                    {entry.index}
                  </span>
                  <span className="chip">{entry.type}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-auto">
                    {entry.date}
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-display)] font-semibold text-sm">
                  {entry.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {entry.org} &middot; {entry.location}
                </p>
              </button>

              {isOpen && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <ul className="space-y-2 mb-3">
                    {entry.bullets.map((b, i) => (
                      <li
                        key={i}
                        className="text-xs text-[var(--text-muted)] leading-relaxed pl-3 border-l-2 border-[var(--primary)]"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.chips.map((c) => (
                      <span key={c} className="chip">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PanelShell>
  );
}
