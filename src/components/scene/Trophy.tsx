import { useRef } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";

export default function Trophy() {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group position={[-5.5, 4.85, -3]}>
      <Hotspot id="trophy" yOffset={1.2}>
        {/* Base */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 0.15, 8]} />
          <meshStandardMaterial
            color={COLORS.trophyBase}
            roughness={0.6}
            flatShading
          />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
          <meshStandardMaterial
            color={COLORS.trophyGold}
            metalness={0.7}
            roughness={0.3}
            flatShading
          />
        </mesh>

        {/* Star / Icosahedron top */}
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.2}>
          <mesh ref={meshRef} position={[0, 0.55, 0]} castShadow>
            <icosahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial
              color={COLORS.trophyGold}
              emissive={COLORS.trophyGold}
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
              flatShading
            />
          </mesh>
        </Float>
      </Hotspot>
    </group>
  );
}
