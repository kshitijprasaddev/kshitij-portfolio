"use client";

import { useState } from "react";
import PanelShell from "./PanelShell";
import { thesisProject, projects } from "@/data/projects";
import type { Project } from "@/types";

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <div className="card cursor-pointer" onClick={onClick}>
      {project.image && (
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-40 object-cover rounded-lg mb-3"
        />
      )}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-[family-name:var(--font-display)] font-semibold text-sm">
          {project.title}
        </h3>
        {project.badge && <span className="chip shrink-0">{project.badge}</span>}
      </div>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {project.tags.slice(0, 4).map((t) => (
          <span key={t} className="chip">{t}</span>
        ))}
        {project.tags.length > 4 && (
          <span className="chip">+{project.tags.length - 4}</span>
        )}
      </div>
    </div>
  );
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="btn mb-4 text-sm">← Back to Projects</button>
      
      {project.badge && <span className="chip mb-3 inline-block">{project.badge}</span>}
      <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">
        {project.title}
      </h3>
      {project.subtitle && (
        <p className="text-xs text-[var(--text-muted)] mb-4">{project.subtitle}</p>
      )}
      <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
        {project.description}
      </p>

      {project.video && (
        <video
          src={project.video}
          controls
          muted
          className="w-full rounded-lg mb-4"
        />
      )}

      {project.image && !project.video && (
        <img src={project.image} alt={project.title} className="w-full rounded-lg mb-4" />
      )}

      {project.features && project.features.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {project.features.map((f, i) => (
            <div key={i} className="card">
              <h4 className="font-semibold text-sm mb-1">{f.title}</h4>
              <p className="text-xs text-[var(--text-muted)]">{f.description}</p>
            </div>
          ))}
        </div>
      )}

      {project.impacts && project.impacts.length > 0 && (
        <div className="flex gap-4 mb-4">
          {project.impacts.map((imp, i) => (
            <div key={i} className="text-center">
              <div className="text-lg font-bold text-[var(--primary)]">{imp.value}</div>
              <div className="text-xs text-[var(--text-muted)]">{imp.label}</div>
            </div>
          ))}
        </div>
      )}

      {project.bullets && (
        <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-1 mb-4">
          {project.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}

      {project.gallery && project.gallery.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {project.gallery.map((g, i) => (
            <div key={i}>
              <img src={g.src} alt={g.caption || ""} className="rounded-lg w-full" />
              {g.caption && <p className="text-xs text-[var(--text-muted)] mt-1">{g.caption}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.tags.map((t) => <span key={t} className="chip">{t}</span>)}
      </div>

      {project.links && (
        <div className="flex gap-3">
          {project.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary text-sm">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPanel() {
  const [selected, setSelected] = useState<Project | null>(null);

  if (selected) {
    return (
      <PanelShell eyebrow="Portfolio" title={selected.title}>
        <ProjectDetail project={selected} onBack={() => setSelected(null)} />
      </PanelShell>
    );
  }

  return (
    <PanelShell eyebrow="Portfolio" title="Projects">
      <p className="panel-subtitle">
        Research, engineering, and award-winning work in autonomous systems.
      </p>

      {/* Featured thesis */}
      <div className="mb-6">
        <ProjectCard project={thesisProject} onClick={() => setSelected(thesisProject)} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} onClick={() => setSelected(p)} />
        ))}
      </div>
    </PanelShell>
  );
}
