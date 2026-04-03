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
        0.15 + Math.sin(clock.getElapsedTime() * 0.8) * 0.05;
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

      {/* Screen face — IDE dark background */}
      <mesh ref={screenRef} position={[0, 1, 0.045]}>
        <planeGeometry args={[1.65, 0.95]} />
        <meshStandardMaterial
          color="#0d1117"
          emissive={COLORS.primary}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Code syntax lines on screen */}
      {[
        { y: 0.34, w: 0.4, c: "#c678dd" },
        { y: 0.26, w: 0.65, c: "#e5c07b" },
        { y: 0.18, w: 0.5, c: "#abb2bf" },
        { y: 0.10, w: 0.45, c: "#98c379" },
        { y: 0.02, w: 0.2, c: "#c678dd" },
        { y: -0.06, w: 0.55, c: "#61afef" },
        { y: -0.14, w: 0.7, c: "#abb2bf" },
        { y: -0.22, w: 0.4, c: "#e06c75" },
        { y: -0.30, w: 0.6, c: "#98c379" },
      ].map(({ y, w, c }, i) => (
        <mesh key={`line-${i}`} position={[-0.45 + w * 0.2, 1 + y, 0.048]}>
          <planeGeometry args={[w * 0.45, 0.016]} />
          <meshBasicMaterial color={c} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* RGB backlight behind monitor */}
      <mesh position={[0, 1, -0.06]}>
        <planeGeometry args={[2.2, 1.5]} />
        <meshBasicMaterial
          color={COLORS.primary}
          transparent
          opacity={0.08}
        />
      </mesh>
      <pointLight
        position={[0, 1, -0.15]}
        intensity={0.3}
        color={COLORS.primary}
        distance={3}
        decay={2}
      />

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
