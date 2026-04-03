import { useRef } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";

export default function Window() {
  const glowRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as any;
      mat.emissiveIntensity = 0.8 + Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group position={[0, 4.5, -5.85]}>
      <Hotspot id="window" yOffset={1.8}>
        {/* Frame outer */}
        <mesh castShadow>
          <boxGeometry args={[2.4, 2.8, 0.15]} />
          <meshPhysicalMaterial color={COLORS.windowFrame} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Glass — physically-based transmission */}
        <mesh ref={glowRef} position={[0, 0, 0.05]}>
          <planeGeometry args={[2.1, 2.5]} />
          <meshPhysicalMaterial
            color="#e0f0ff"
            emissive="#b0d8ff"
            emissiveIntensity={0.8}
            transmission={0.6}
            roughness={0.05}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Cross divider vertical */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[0.06, 2.6, 0.04]} />
          <meshPhysicalMaterial color={COLORS.windowFrame} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Cross divider horizontal */}
        <mesh position={[0, 0.2, 0.08]}>
          <boxGeometry args={[2.2, 0.06, 0.04]} />
          <meshPhysicalMaterial color={COLORS.windowFrame} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Sill */}
        <mesh position={[0, -1.5, 0.2]}>
          <boxGeometry args={[2.6, 0.1, 0.3]} />
          <meshPhysicalMaterial color="#444" roughness={0.4} metalness={0.2} />
        </mesh>
      </Hotspot>
    </group>
  );
}
