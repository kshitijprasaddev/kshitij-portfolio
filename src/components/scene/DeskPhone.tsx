import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";

export default function DeskPhone() {
  return (
    <group position={[-1.3, 1.6, -2.2]}>
      <Hotspot id="phone" yOffset={0.8}>
        {/* Phone base */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.5, 0.12, 0.35]} />
          <meshPhysicalMaterial color={COLORS.phoneBody} roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Handset cradle */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.55, 0.06, 0.12]} />
          <meshPhysicalMaterial color={COLORS.phoneBody} roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Handset */}
        <mesh position={[0, 0.24, 0]} castShadow>
          <boxGeometry args={[0.5, 0.06, 0.1]} />
          <meshPhysicalMaterial color="#111115" roughness={0.3} metalness={0.3} />
        </mesh>

        {/* Screen on base */}
        <mesh position={[0, 0.145, 0.08]}>
          <planeGeometry args={[0.3, 0.06]} />
          <meshStandardMaterial
            color="#0a1a0a"
            emissive={COLORS.primary}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Envelope beside phone */}
        <mesh position={[0.5, 0.04, 0.1]} rotation-x={-Math.PI / 2} castShadow>
          <boxGeometry args={[0.35, 0.25, 0.02]} />
          <meshStandardMaterial color="#d4c9a8" roughness={0.9} />
        </mesh>

        {/* Envelope flap */}
        <mesh position={[0.5, 0.055, -0.01]} rotation-x={-0.3} castShadow>
          <boxGeometry args={[0.33, 0.01, 0.12]} />
          <meshStandardMaterial color="#c4b998" roughness={0.9} />
        </mesh>
      </Hotspot>
    </group>
  );
}
