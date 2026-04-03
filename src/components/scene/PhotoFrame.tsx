import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";

export default function PhotoFrame() {
  return (
    <group position={[1.5, 1.56, -2.6]}>
      <Hotspot id="photoframe" yOffset={1}>
        {/* Frame border */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.06]} />
          <meshStandardMaterial color="#2a2218" roughness={0.7} flatShading />
        </mesh>

        {/* Photo face */}
        <mesh position={[0, 0.45, 0.032]}>
          <planeGeometry args={[0.4, 0.5]} />
          <meshStandardMaterial
            color="#4a6a3a"
            emissive="#4a6a3a"
            emissiveIntensity={0.05}
          />
        </mesh>

        {/* Stand */}
        <mesh position={[0.15, 0.2, 0.15]} rotation-x={-0.3} castShadow>
          <boxGeometry args={[0.04, 0.45, 0.04]} />
          <meshStandardMaterial color="#2a2218" flatShading />
        </mesh>
      </Hotspot>
    </group>
  );
}
