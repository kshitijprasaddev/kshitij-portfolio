import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";

export default function Monitor() {
  return (
    <group position={[0, 1.56, -2.3]}>
      {/* Screen */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.8, 1.1, 0.08]} />
        <meshStandardMaterial
          color={COLORS.monitor}
          roughness={0.3}
          flatShading
        />
      </mesh>

      {/* Screen face (emissive) */}
      <mesh position={[0, 1, 0.045]}>
        <planeGeometry args={[1.65, 0.95]} />
        <meshStandardMaterial
          color={COLORS.monitorScreen}
          emissive={COLORS.primary}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Stand neck */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color={COLORS.monitor} flatShading />
      </mesh>

      {/* Stand base */}
      <mesh position={[0, 0.02, 0.15]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.4]} />
        <meshStandardMaterial color={COLORS.monitor} flatShading />
      </mesh>

      {/* Keyboard */}
      <mesh position={[0, 0.02, 0.9]} castShadow>
        <boxGeometry args={[1.2, 0.04, 0.4]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.5} flatShading />
      </mesh>

      {/* Mouse */}
      <mesh position={[0.9, 0.02, 0.9]} castShadow>
        <boxGeometry args={[0.2, 0.04, 0.3]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.5} flatShading />
      </mesh>
    </group>
  );
}
