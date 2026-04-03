import { COLORS } from "@/lib/constants";

export default function DeskLamp() {
  return (
    <group position={[-1.6, 1.56, -2.8]}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.08, 8]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.4} flatShading />
      </mesh>

      {/* Arm */}
      <mesh position={[0, 0.45, -0.1]} rotation-z={0.15} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Shade */}
      <mesh position={[0.06, 0.85, -0.15]} rotation-z={0.3} castShadow>
        <coneGeometry args={[0.18, 0.2, 8, 1, true]} />
        <meshStandardMaterial color="#1a1a1e" side={2} flatShading />
      </mesh>

      {/* Bulb glow */}
      <pointLight
        position={[0.06, 0.78, -0.15]}
        intensity={0.3}
        color="#ffe8c0"
        distance={3}
        decay={2}
      />
    </group>
  );
}
