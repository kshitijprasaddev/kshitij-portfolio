import { useRef } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";

export default function Monitor() {
  const screenRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (screenRef.current) {
      const mat = screenRef.current.material as any;
      mat.emissiveIntensity =
        0.4 + Math.sin(clock.getElapsedTime() * 0.8) * 0.1;
    }
  });

  return (
    <group position={[0, 1.6, -2.5]}>
      {/* Screen bezel — reflective dark */}
      <mesh position={[0, 1, 0]} castShadow>
        <RoundedBox args={[1.8, 1.1, 0.08]} radius={0.02} smoothness={4}>
          <meshPhysicalMaterial
            color={COLORS.monitor}
            roughness={0.1}
            metalness={0.9}
          />
        </RoundedBox>
      </mesh>

      {/* Screen face — animated emissive glow */}
      <mesh ref={screenRef} position={[0, 1, 0.045]}>
        <planeGeometry args={[1.65, 0.95]} />
        <meshStandardMaterial
          color="#0a1a08"
          emissive={COLORS.primary}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Stand neck */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 16]} />
        <meshPhysicalMaterial
          color={COLORS.monitor}
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>

      {/* Stand base */}
      <mesh position={[0, 0.02, 0.15]} castShadow>
        <RoundedBox args={[0.6, 0.04, 0.4]} radius={0.01} smoothness={4}>
          <meshPhysicalMaterial
            color={COLORS.monitor}
            metalness={0.8}
            roughness={0.15}
          />
        </RoundedBox>
      </mesh>

      {/* Keyboard */}
      <mesh position={[0, 0.02, 0.9]} castShadow>
        <RoundedBox args={[1.2, 0.04, 0.4]} radius={0.01} smoothness={4}>
          <meshPhysicalMaterial color="#1a1a1e" roughness={0.4} metalness={0.2} />
        </RoundedBox>
      </mesh>

      {/* Mouse */}
      <mesh position={[0.9, 0.02, 0.9]} castShadow>
        <RoundedBox args={[0.2, 0.04, 0.3]} radius={0.01} smoothness={4}>
          <meshPhysicalMaterial color="#1a1a1e" roughness={0.4} metalness={0.2} />
        </RoundedBox>
      </mesh>
    </group>
  );
}
