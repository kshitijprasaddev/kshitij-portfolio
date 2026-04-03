import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";

export default function Whiteboard() {
  return (
    <group position={[1.5, 3.8, -5.85]}>
      <Hotspot id="whiteboard" yOffset={1.5}>
        {/* Board */}
        <mesh castShadow>
          <boxGeometry args={[3, 2, 0.1]} />
          <meshStandardMaterial color={COLORS.whiteboard} roughness={0.4} flatShading />
        </mesh>

        {/* Frame top */}
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[3.1, 0.06, 0.14]} />
          <meshStandardMaterial color={COLORS.whiteboardFrame} roughness={0.6} flatShading />
        </mesh>
        {/* Frame bottom */}
        <mesh position={[0, -1.02, 0]}>
          <boxGeometry args={[3.1, 0.06, 0.14]} />
          <meshStandardMaterial color={COLORS.whiteboardFrame} roughness={0.6} flatShading />
        </mesh>
        {/* Frame left */}
        <mesh position={[-1.52, 0, 0]}>
          <boxGeometry args={[0.06, 2.1, 0.14]} />
          <meshStandardMaterial color={COLORS.whiteboardFrame} roughness={0.6} flatShading />
        </mesh>
        {/* Frame right */}
        <mesh position={[1.52, 0, 0]}>
          <boxGeometry args={[0.06, 2.1, 0.14]} />
          <meshStandardMaterial color={COLORS.whiteboardFrame} roughness={0.6} flatShading />
        </mesh>

        {/* Tray */}
        <mesh position={[0, -1.15, 0.12]}>
          <boxGeometry args={[2.5, 0.06, 0.15]} />
          <meshStandardMaterial color={COLORS.whiteboardFrame} flatShading />
        </mesh>

        {/* Doodle lines (colored accents) */}
        <mesh position={[-0.5, 0.3, 0.06]}>
          <boxGeometry args={[1.2, 0.03, 0.01]} />
          <meshStandardMaterial color={COLORS.primary} emissive={COLORS.primary} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.3, -0.1, 0.06]}>
          <boxGeometry args={[0.8, 0.03, 0.01]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[-0.2, -0.5, 0.06]}>
          <boxGeometry args={[1.5, 0.03, 0.01]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </Hotspot>
    </group>
  );
}
