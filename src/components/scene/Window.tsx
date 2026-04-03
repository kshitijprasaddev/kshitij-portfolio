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
      mat.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 0.5) * 0.15;
    }
  });

  return (
    <group position={[0, 4.5, -5.85]}>
      <Hotspot id="window" yOffset={1.8}>
        {/* Frame outer */}
        <mesh castShadow>
          <boxGeometry args={[2.4, 2.8, 0.15]} />
          <meshStandardMaterial color={COLORS.windowFrame} roughness={0.6} flatShading />
        </mesh>

        {/* Glass / daylight glow */}
        <mesh ref={glowRef} position={[0, 0, 0.05]}>
          <planeGeometry args={[2.1, 2.5]} />
          <meshStandardMaterial
            color={COLORS.windowGlow}
            emissive={COLORS.windowGlow}
            emissiveIntensity={0.6}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Cross divider vertical */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[0.06, 2.6, 0.04]} />
          <meshStandardMaterial color={COLORS.windowFrame} flatShading />
        </mesh>

        {/* Cross divider horizontal */}
        <mesh position={[0, 0.2, 0.08]}>
          <boxGeometry args={[2.2, 0.06, 0.04]} />
          <meshStandardMaterial color={COLORS.windowFrame} flatShading />
        </mesh>

        {/* Sill */}
        <mesh position={[0, -1.5, 0.2]}>
          <boxGeometry args={[2.6, 0.1, 0.3]} />
          <meshStandardMaterial color="#444" roughness={0.6} flatShading />
        </mesh>
      </Hotspot>
    </group>
  );
}
