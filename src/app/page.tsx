"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useRoomStore } from "@/hooks/useRoomStore";
import Preloader from "@/components/ui/Preloader";
import PanelOverlay from "@/components/panels/PanelOverlay";
import HUD from "@/components/ui/HUD";

const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), {
  ssr: false,
});

export default function Home() {
  const ready = useRoomStore((s) => s.ready);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Preloader */}
      <Preloader visible={!ready} />

      {/* 3D Canvas */}
      {mounted && (
        <div id="scene-root">
          <Suspense fallback={null}>
            <SceneCanvas />
          </Suspense>
        </div>
      )}

      {/* HUD overlays */}
      <HUD />

      {/* Content panels */}
      <PanelOverlay />
    </main>
  );
}
