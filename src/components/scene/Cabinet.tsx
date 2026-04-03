import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";

export default function Cabinet() {
  return (
    <group position={[4.5, 0, -4]}>
      <Hotspot id="cabinet" yOffset={3}>
        {/* Body */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[1.2, 3, 0.8]} />
          <meshStandardMaterial color={COLORS.cabinet} roughness={0.6} flatShading />
        </mesh>

        {/* Drawer lines */}
        {[0.5, 1.2, 1.9, 2.6].map((y, i) => (
          <mesh key={i} position={[0, y, 0.41]}>
            <boxGeometry args={[1.1, 0.02, 0.01]} />
            <meshStandardMaterial color="#1a1a1e" />
          </mesh>
        ))}

        {/* Drawer handles */}
        {[0.85, 1.55, 2.25].map((y, i) => (
          <mesh key={`h-${i}`} position={[0, y, 0.44]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
            <meshStandardMaterial color={COLORS.cabinetHandle} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}

        {/* Top surface */}
        <mesh position={[0, 3.02, 0]}>
          <boxGeometry args={[1.24, 0.04, 0.84]} />
          <meshStandardMaterial color="#333338" roughness={0.5} flatShading />
        </mesh>

        {/* Small plant pot on top */}
        <mesh position={[0.3, 3.2, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.2, 8]} />
          <meshStandardMaterial color="#8b4513" roughness={0.8} flatShading />
        </mesh>
        <mesh position={[0.3, 3.45, 0]} castShadow>
          <icosahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#2d5016" roughness={0.8} flatShading />
        </mesh>
      </Hotspot>
    </group>
  );
}
