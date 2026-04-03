import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";

export default function PhotoFrame() {
  return (
    <group position={[1.5, 1.56, -2.6]}>
      <Hotspot id="photoframe" yOffset={1}>
        {/* Frame border — walnut with clearcoat */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.06]} />
          <meshPhysicalMaterial
            color="#2a2218"
            roughness={0.5}
            clearcoat={0.2}
            clearcoatRoughness={0.3}
          />
        </mesh>

        {/* Photo face — slight glass overlay */}
        <mesh position={[0, 0.45, 0.032]}>
          <planeGeometry args={[0.4, 0.5]} />
          <meshPhysicalMaterial
            color="#4a6a3a"
            emissive="#4a6a3a"
            emissiveIntensity={0.08}
            roughness={0.1}
            transmission={0.15}
          />
        </mesh>

        {/* Stand */}
        <mesh position={[0.15, 0.2, 0.15]} rotation-x={-0.3} castShadow>
          <boxGeometry args={[0.04, 0.45, 0.04]} />
          <meshPhysicalMaterial color="#2a2218" roughness={0.5} />
        </mesh>
      </Hotspot>
    </group>
  );
}
