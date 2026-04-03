"use client";

import PanelShell from "./PanelShell";
import { skillGroups, techIcons } from "@/data/skills";

const iconMap: Record<string, string> = {
  cog: "⚙️",
  code: "💻",
  radio: "📡",
  box: "📦",
  cpu: "🔧",
};

export default function SkillsPanel() {
  return (
    <PanelShell eyebrow="Technical" title="Skills & Tech Stack">
      <p className="panel-subtitle">
        Core competencies across robotics, programming, and systems engineering.
      </p>

      {/* Skill groups */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {skillGroups.map((group) => (
          <div key={group.title} className="card">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{iconMap[group.icon] || "🔹"}</span>
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-sm">
                {group.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.skills.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tech icons */}
      <h3 className="panel-eyebrow mb-4">Technologies</h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
        {techIcons.map((tech) => (
          <a
            key={tech.name}
            href={tech.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--bg-card)] transition-colors"
          >
            <img
              src={tech.img}
              alt={tech.name}
              className="w-8 h-8 object-contain"
            />
            <span className="text-[10px] text-[var(--text-muted)] text-center">
              {tech.name}
            </span>
          </a>
        ))}
      </div>
    </PanelShell>
  );
}
