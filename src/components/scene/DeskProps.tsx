"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Animated steam particles above coffee mug */
function Steam() {
  const ref = useRef<THREE.Points>(null);
  const count = 20;

  const [geometry, basePositions] = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.03;
      arr[i * 3 + 1] = Math.random() * 0.12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return [geo, arr] as const;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + 0.002;
      if (y > 0.15) y = 0;
      pos.setY(i, y);
      pos.setX(i, basePositions[i * 3] + Math.sin(t * 2 + i) * 0.004);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref} position={[0, 0.06, 0]} geometry={geometry}>
      <pointsMaterial
        color="#ffffff"
        size={0.008}
        transparent
        opacity={0.25}
        depthWrite={false}
      />
    </points>
  );
}

function CoffeeMug() {
  return (
    <group position={[1.2, 1.58, -1.8]}>
      {/* Mug body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.045, 0.04, 0.09, 16]} />
        <meshPhysicalMaterial color="#f0e8d8" roughness={0.3} clearcoat={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.055, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.028, 0.008, 8, 16, Math.PI]} />
        <meshPhysicalMaterial color="#f0e8d8" roughness={0.3} />
      </mesh>
      {/* Coffee surface */}
      <mesh position={[0, 0.042, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.042, 16]} />
        <meshStandardMaterial color="#1a0a02" roughness={0.95} />
      </mesh>
      {/* Coaster */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.008, 16]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.7} />
      </mesh>
      <Steam />
    </group>
  );
}

function PenHolder() {
  return (
    <group position={[-0.8, 1.58, -2.8]}>
      {/* Holder cylinder */}
      <mesh castShadow>
        <cylinderGeometry args={[0.035, 0.03, 0.09, 12]} />
        <meshPhysicalMaterial color="#2a2a2e" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Pens */}
      {(["#1a1a1a", "#1a3a5c", "#5c1a2a"] as const).map((color, i) => (
        <mesh
          key={i}
          position={[(i - 1) * 0.012, 0.07, (i - 1) * 0.008]}
          rotation-z={(i - 1) * 0.06}
        >
          <cylinderGeometry args={[0.004, 0.004, 0.1, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Notebook() {
  return (
    <group position={[0.5, 1.58, -1.5]} rotation-y={0.15}>
      <mesh castShadow>
        <boxGeometry args={[0.18, 0.012, 0.25]} />
        <meshStandardMaterial color="#1a2844" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.003, 0]}>
        <boxGeometry args={[0.17, 0.008, 0.24]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.95} />
      </mesh>
    </group>
  );
}

function PaperStack() {
  return (
    <group position={[-0.4, 1.58, -1.4]} rotation-y={-0.1}>
      {([0, 0.002, 0.004] as const).map((y, i) => (
        <mesh
          key={i}
          position={[(i - 1) * 0.003, y, (i - 1) * 0.002]}
          castShadow
        >
          <boxGeometry args={[0.2, 0.001, 0.28]} />
          <meshStandardMaterial color="#f8f5f0" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function SmallPlant() {
  return (
    <group position={[1.6, 1.58, -2.6]}>
      {/* Small pot */}
      <mesh castShadow>
        <cylinderGeometry args={[0.035, 0.025, 0.05, 10]} />
        <meshPhysicalMaterial color="#c67234" roughness={0.6} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.023, 0]}>
        <cylinderGeometry args={[0.033, 0.033, 0.005, 10]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} />
      </mesh>
      {/* Small foliage */}
      {([
        [0, 0.06, 0, 0.025],
        [0.015, 0.055, 0.01, 0.02],
        [-0.01, 0.05, -0.012, 0.018],
      ] as [number, number, number, number][]).map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 8, 8]} />
          <meshStandardMaterial color="#2a5a1a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export default function DeskProps() {
  return (
    <group>
      <CoffeeMug />
      <PenHolder />
      <Notebook />
      <PaperStack />
      <SmallPlant />
    </group>
  );
}
