"use client";

import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  N8AO,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { ACESFilmicToneMapping } from "three";
import Room from "./Room";
import CameraRig from "./CameraRig";
import Lighting from "./Lighting";
import { useRoomStore } from "@/hooks/useRoomStore";
import { useEffect, useState } from "react";

export default function SceneCanvas() {
  const setReady = useRoomStore((s) => s.setReady);
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    const t = setTimeout(() => setReady(), 1200);
    return () => clearTimeout(t);
  }, [setReady]);

  return (
    <Canvas
      shadows
      dpr={[1, dpr]}
      camera={{ position: [9, 7, 9], fov: 40, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.5,
      }}
      style={{ background: "#0a0a0a" }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(1.5)}
      />
      <CameraRig />
      <Lighting />
      <Room />

      <EffectComposer multisampling={4}>
        <N8AO
          aoRadius={0.5}
          intensity={1}
          distanceFalloff={0.5}
        />
        <Bloom
          luminanceThreshold={1.0}
          luminanceSmoothing={0.4}
          intensity={0.4}
          mipmapBlur
        />
        <Noise opacity={0.012} />
        <Vignette offset={0.3} darkness={0.3} />
      </EffectComposer>
    </Canvas>
  );
}
