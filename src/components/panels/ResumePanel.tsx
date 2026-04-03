"use client";

import PanelShell from "./PanelShell";

export default function ResumePanel() {
  return (
    <PanelShell eyebrow="Documents" title="Resume & CV">
      <p className="panel-subtitle">
        Download or view my documents below.
      </p>

      <div className="space-y-4">
        <div className="card">
          <h3 className="font-[family-name:var(--font-display)] font-semibold text-sm mb-2">
            Resume
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            One-page professional resume, current as of 2025.
          </p>
          <div className="flex gap-3">
            <a
              href="/pdfs/Resume_KshitijPrasad.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-sm"
            >
              View Resume
            </a>
            <a
              href="/pdfs/Resume_KshitijPrasad.pdf"
              download
              className="btn text-sm"
            >
              Download
            </a>
          </div>
        </div>

        <div className="card">
          <h3 className="font-[family-name:var(--font-display)] font-semibold text-sm mb-2">
            Curriculum Vitae
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Detailed academic and professional CV.
          </p>
          <div className="flex gap-3">
            <a
              href="/pdfs/CV_Kshitij_Prasad.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-sm"
            >
              View CV
            </a>
            <a
              href="/pdfs/CV_Kshitij_Prasad.pdf"
              download
              className="btn text-sm"
            >
              Download
            </a>
          </div>
        </div>

        <div className="card">
          <h3 className="font-[family-name:var(--font-display)] font-semibold text-sm mb-2">
            Thesis
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Full thesis: Autonomous Precision Landing via Deep Reinforcement Learning.
          </p>
          <div className="flex gap-3">
            <a
              href="/pdfs/thesis-kshitij.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-sm"
            >
              View Thesis
            </a>
            <a
              href="/pdfs/thesis-kshitij.pdf"
              download
              className="btn text-sm"
            >
              Download
            </a>
          </div>
        </div>
      </div>

      {/* PDF preview */}
      <div className="mt-6">
        <h3 className="panel-eyebrow mb-3">Preview</h3>
        <iframe
          src="/pdfs/Resume_KshitijPrasad.pdf"
          className="w-full h-[500px] rounded-lg border border-[var(--border)]"
          title="Resume Preview"
        />
      </div>
    </PanelShell>
  );
}
