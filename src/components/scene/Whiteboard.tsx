import { COLORS } from "@/lib/constants";
import { RoundedBox } from "@react-three/drei";
import Hotspot from "./Hotspot";

export default function Whiteboard() {
  return (
    <group position={[1.5, 3.8, -5.85]}>
      <Hotspot id="whiteboard" yOffset={1.5}>
        {/* Board — glossy surface */}
        <mesh castShadow>
          <RoundedBox args={[3, 2, 0.1]} radius={0.02} smoothness={4}>
            <meshPhysicalMaterial color={COLORS.whiteboard} roughness={0.15} />
          </RoundedBox>
        </mesh>

        {/* Frame top */}
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[3.1, 0.06, 0.14]} />
          <meshPhysicalMaterial color={COLORS.whiteboardFrame} roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Frame bottom */}
        <mesh position={[0, -1.02, 0]}>
          <boxGeometry args={[3.1, 0.06, 0.14]} />
          <meshPhysicalMaterial color={COLORS.whiteboardFrame} roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Frame left */}
        <mesh position={[-1.52, 0, 0]}>
          <boxGeometry args={[0.06, 2.1, 0.14]} />
          <meshPhysicalMaterial color={COLORS.whiteboardFrame} roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Frame right */}
        <mesh position={[1.52, 0, 0]}>
          <boxGeometry args={[0.06, 2.1, 0.14]} />
          <meshPhysicalMaterial color={COLORS.whiteboardFrame} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Tray */}
        <mesh position={[0, -1.15, 0.12]}>
          <boxGeometry args={[2.5, 0.06, 0.15]} />
          <meshPhysicalMaterial color={COLORS.whiteboardFrame} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Doodle lines (colored accents — bloom-friendly) */}
        <mesh position={[-0.5, 0.3, 0.06]}>
          <boxGeometry args={[1.2, 0.03, 0.01]} />
          <meshStandardMaterial color={COLORS.primary} emissive={COLORS.primary} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.3, -0.1, 0.06]}>
          <boxGeometry args={[0.8, 0.03, 0.01]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[-0.2, -0.5, 0.06]}>
          <boxGeometry args={[1.5, 0.03, 0.01]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.15} />
        </mesh>
      </Hotspot>
    </group>
  );
}
