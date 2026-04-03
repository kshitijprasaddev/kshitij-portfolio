import { Environment } from "@react-three/drei";
import { COLORS } from "@/lib/constants";

export default function Lighting() {
  return (
    <>
      {/* Global ambient */}
      <ambientLight intensity={0.3} />

      {/* Main directional (sun from window) */}
      <directionalLight
        position={[2, 8, -4]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={25}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-5}
        shadow-bias={-0.001}
        color="#f0e8d8"
      />

      {/* Fill light from right side */}
      <directionalLight
        position={[6, 4, 3]}
        intensity={0.3}
        color="#d0d8ff"
      />

      {/* Green accent on trophy area */}
      <pointLight
        position={[-5.5, 5.5, -2]}
        intensity={0.5}
        color={COLORS.primary}
        distance={4}
        decay={2}
      />

      {/* Warm desk lamp glow */}
      <pointLight
        position={[0, 3, -1.5]}
        intensity={0.4}
        color="#ffe8c0"
        distance={5}
        decay={2}
      />

      {/* Window backlight */}
      <pointLight
        position={[0, 5, -5.5]}
        intensity={0.8}
        color={COLORS.windowGlow}
        distance={6}
        decay={2}
      />

      {/* Environment map for reflections */}
      <Environment preset="apartment" />
    </>
  );
}
