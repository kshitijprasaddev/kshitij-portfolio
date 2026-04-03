"use client";

import PanelShell from "./PanelShell";
import { contactMethods } from "@/data/personal";

const iconMap: Record<string, string> = {
  mail: "✉️",
  linkedin: "🔗",
  phone: "📞",
  calendar: "📅",
};

export default function ContactPanel() {
  return (
    <PanelShell eyebrow="Connect" title="Get in Touch">
      <p className="panel-subtitle">
        Reach out for collaborations, opportunities, or just to say hello.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contactMethods.map((method) => (
          <a
            key={method.title}
            href={method.href}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-start gap-3 no-underline hover:border-[var(--primary)] transition-colors"
          >
            <span className="text-2xl mt-0.5">{iconMap[method.icon] || "📌"}</span>
            <div>
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-sm mb-0.5">
                {method.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">{method.value}</p>
            </div>
          </a>
        ))}
      </div>
    </PanelShell>
  );
}
