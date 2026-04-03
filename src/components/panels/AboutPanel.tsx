"use client";

import PanelShell from "./PanelShell";
import { about } from "@/data/personal";

export default function AboutPanel() {
  return (
    <PanelShell eyebrow="Personal" title="About Me">
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <img
          src={about.headshot}
          alt="Kshitij Prasad"
          className="w-32 h-32 rounded-xl object-cover border border-[var(--border)]"
        />
        <div>
          <p className="text-sm leading-relaxed mb-3">{about.lead}</p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{about.body}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h4 className="font-[family-name:var(--font-mono)] text-xs text-[var(--primary)] mb-2">
            Location
          </h4>
          <p className="text-sm">{about.location}</p>
        </div>
        <div className="card">
          <h4 className="font-[family-name:var(--font-mono)] text-xs text-[var(--primary)] mb-2">
            Education
          </h4>
          <p className="text-sm">{about.education}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{about.status}</p>
        </div>
        <div className="card">
          <h4 className="font-[family-name:var(--font-mono)] text-xs text-[var(--primary)] mb-2">
            Languages
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {about.languages.map((l) => (
              <span key={l} className="chip">{l}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <h4 className="font-[family-name:var(--font-mono)] text-xs text-[var(--primary)] mb-2">
            Focus Areas
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {about.focusAreas.map((f) => (
              <span key={f} className="chip">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Belief quote */}
      <div className="card border-l-2 border-l-[var(--primary)]">
        <p className="text-sm italic text-[var(--text-muted)]">&ldquo;{about.belief}&rdquo;</p>
      </div>
    </PanelShell>
  );
}
