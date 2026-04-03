import { Environment, SoftShadows } from "@react-three/drei";
import { COLORS } from "@/lib/constants";

export default function Lighting() {
  return (
    <>
      <SoftShadows size={25} samples={16} focus={0} />

      {/* Reduced ambient for dramatic contrast */}
      <ambientLight intensity={0.15} />

      {/* Main directional (sun from window) — high-res shadows */}
      <directionalLight
        position={[2, 8, -4]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={25}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0005}
        color="#f0e8d8"
      />

      {/* Fill light from right side — cool blue */}
      <directionalLight
        position={[6, 4, 3]}
        intensity={0.25}
        color="#d0d8ff"
      />

      {/* Rect area light above desk — warm bounce */}
      <rectAreaLight
        position={[0, 6, -1]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={4}
        height={3}
        intensity={0.6}
        color="#ffe8c0"
      />

      {/* Green accent on trophy area */}
      <pointLight
        position={[-5.5, 5.5, -2]}
        intensity={0.6}
        color={COLORS.primary}
        distance={5}
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

      {/* Window backlight — stronger for volumetric effect */}
      <pointLight
        position={[0, 5, -5.5]}
        intensity={1.2}
        color={COLORS.windowGlow}
        distance={8}
        decay={2}
      />

      {/* Environment map for realistic reflections — moody city */}
      <Environment preset="city" />
    </>
  );
}
