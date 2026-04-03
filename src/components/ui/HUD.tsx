"use client";

import { useRoomStore } from "@/hooks/useRoomStore";

const labels: { id: string; text: string }[] = [
  { id: "monitor", text: "Projects" },
  { id: "bookshelf", text: "Experience" },
  { id: "whiteboard", text: "Skills" },
  { id: "cabinet", text: "Resume" },
  { id: "photoframe", text: "About" },
  { id: "phone", text: "Contact" },
  { id: "trophy", text: "Achievement" },
  { id: "window", text: "Vision" },
];

export default function HUD() {
  const activePanel = useRoomStore((s) => s.activePanel);
  const ready = useRoomStore((s) => s.ready);

  if (activePanel || !ready) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
      <div className="font-[family-name:var(--font-mono)] text-xs text-[var(--text-muted)] bg-[rgba(0,0,0,0.7)] backdrop-blur-md border border-[var(--border)] rounded-full px-4 py-2">
        Click any object to explore
      </div>
    </div>
  );
}
