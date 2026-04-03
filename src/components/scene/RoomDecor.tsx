"use client";

import { DoubleSide } from "three";
import { COLORS } from "@/lib/constants";

function LargePlant() {
  return (
    <group position={[5.5, 0, 2]}>
      {/* Pot */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.22, 0.55, 12]} />
        <meshPhysicalMaterial color="#7a4a2a" roughness={0.65} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 12]} />
        <meshStandardMaterial color="#1a0e05" roughness={1} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 0.7, 8]} />
        <meshStandardMaterial color="#3a2a18" roughness={0.75} />
      </mesh>
      {/* Foliage clusters */}
      {([
        [0, 1.1, 0, 0.35],
        [0.18, 0.95, 0.1, 0.28],
        [-0.15, 0.85, -0.1, 0.22],
        [0.08, 1.3, -0.05, 0.22],
        [-0.12, 1.05, 0.15, 0.26],
      ] as [number, number, number, number][]).map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 10, 10]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#1e4a15" : "#2a5a1e"}
            roughness={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

function AreaRug() {
  return (
    <mesh position={[0, 0.005, -0.5]} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[5.5, 4.5]} />
      <meshStandardMaterial color="#2a2420" roughness={0.95} />
    </mesh>
  );
}

function WallFrames() {
  const frames = [
    {
      pos: [-6.85, 3.8, -2] as [number, number, number],
      w: 1.0,
      h: 0.7,
      picColor: "#1a2a3a",
    },
    {
      pos: [-6.85, 3.5, 1.2] as [number, number, number],
      w: 0.7,
      h: 0.9,
      picColor: "#2a1a2a",
    },
  ];

  return (
    <group>
      {frames.map(({ pos, w, h, picColor }, i) => (
        <group key={i} position={pos} rotation-y={Math.PI / 2}>
          {/* Frame */}
          <mesh castShadow>
            <boxGeometry args={[w, h, 0.03]} />
            <meshPhysicalMaterial
              color="#1e1e1e"
              roughness={0.25}
              metalness={0.8}
            />
          </mesh>
          {/* Picture */}
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[w - 0.08, h - 0.08]} />
            <meshStandardMaterial color={picColor} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CeilingLight() {
  return (
    <group position={[0, 7.8, -2]}>
      {/* Cable */}
      <mesh>
        <cylinderGeometry args={[0.008, 0.008, 1.2, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Shade */}
      <mesh position={[0, -0.65, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.25, 0.18, 16, 1, true]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          roughness={0.35}
          metalness={0.85}
          side={DoubleSide}
        />
      </mesh>
      {/* Bulb */}
      <mesh position={[0, -0.7, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial
          color="#ffe8c0"
          emissive="#ffe8c0"
          emissiveIntensity={2.5}
        />
      </mesh>
      {/* Light source */}
      <pointLight
        position={[0, -0.72, 0]}
        intensity={0.6}
        color="#ffe8c0"
        distance={5}
        decay={2}
      />
    </group>
  );
}

function FloatingShelf() {
  return (
    <group position={[-6.82, 5.5, -3.5]} rotation-y={Math.PI / 2}>
      {/* Shelf board */}
      <mesh castShadow>
        <boxGeometry args={[1.0, 0.03, 0.25]} />
        <meshStandardMaterial color="#3a2a18" roughness={0.7} />
      </mesh>
      {/* Books */}
      {([
        { x: -0.3, h: 0.2, c: "#8b2500" },
        { x: -0.2, h: 0.22, c: "#1a3a5c" },
        { x: -0.1, h: 0.18, c: "#2a4a2a" },
        { x: 0.05, h: 0.24, c: "#4a2a4a" },
        { x: 0.15, h: 0.19, c: "#5a4a1a" },
      ] as const).map(({ x, h, c }, i) => (
        <mesh key={i} position={[x, 0.015 + h / 2, 0]} castShadow>
          <boxGeometry args={[0.06, h, 0.16]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function LEDStrip() {
  return (
    <>
      {/* LED strip along back wall baseboard - subtle accent */}
      <mesh position={[0, 0.35, -5.85]}>
        <boxGeometry args={[12, 0.02, 0.02]} />
        <meshStandardMaterial
          color={COLORS.primary}
          emissive={COLORS.primary}
          emissiveIntensity={0.8}
        />
      </mesh>
    </>
  );
}

export default function RoomDecor() {
  return (
    <group>
      <LargePlant />
      <AreaRug />
      <WallFrames />
      <CeilingLight />
      <FloatingShelf />
      <LEDStrip />
    </group>
  );
}
