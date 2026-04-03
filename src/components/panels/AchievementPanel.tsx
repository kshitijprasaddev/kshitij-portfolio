"use client";

import PanelShell from "./PanelShell";
import { achievement } from "@/data/personal";

export default function AchievementPanel() {
  return (
    <PanelShell eyebrow="Award" title={achievement.title}>
      <p className="panel-subtitle">{achievement.subtitle}</p>

      {/* Gallery */}
      <div className="space-y-4 mb-6">
        {achievement.gallery.map((item, i) => (
          <div key={i}>
            <img
              src={item.src}
              alt={item.caption || ""}
              className={`w-full rounded-xl object-cover border border-[var(--border)] ${
                item.featured ? "max-h-[400px]" : "max-h-[300px]"
              }`}
            />
            {item.caption && (
              <p className="text-xs text-[var(--text-muted)] mt-2">{item.caption}</p>
            )}
          </div>
        ))}
      </div>

      <a
        href={achievement.paveUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary text-sm"
      >
        Learn about PAVE
      </a>
    </PanelShell>
  );
}
