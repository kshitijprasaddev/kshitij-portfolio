"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import Room from "./Room";
import CameraRig from "./CameraRig";
import Lighting from "./Lighting";
import { useRoomStore } from "@/hooks/useRoomStore";
import { useEffect } from "react";

export default function SceneCanvas() {
  const setReady = useRoomStore((s) => s.setReady);

  useEffect(() => {
    // Give the scene a moment to mount, then mark ready
    const t = setTimeout(() => setReady(), 1200);
    return () => clearTimeout(t);
  }, [setReady]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [9, 7, 9], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#0a0a0a" }}
    >
      <AdaptiveDpr pixelated />
      <CameraRig />
      <Lighting />
      <Room />
    </Canvas>
  );
}
