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
    <group position={[-5.5, 4.3, -4]}>
      <Hotspot id="trophy" yOffset={1.2}>
        {/* Base */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 0.15, 16]} />
          <meshPhysicalMaterial
            color="#b8860b"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.25, 16]} />
          <meshPhysicalMaterial
            color={COLORS.trophyGold}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>

        {/* Star / Icosahedron top — bloom-ready gold */}
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.2}>
          <mesh ref={meshRef} position={[0, 0.55, 0]} castShadow>
            <icosahedronGeometry args={[0.2, 1]} />
            <meshPhysicalMaterial
              color={COLORS.trophyGold}
              emissive={COLORS.trophyGold}
              emissiveIntensity={0.6}
              metalness={1.0}
              roughness={0.1}
            />
          </mesh>
        </Float>
      </Hotspot>
    </group>
  );
}
