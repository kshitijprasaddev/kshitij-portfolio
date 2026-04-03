import { useRef } from "react";
import { Group } from "three";
import { RoundedBox } from "@react-three/drei";
import { COLORS } from "@/lib/constants";
import { useRoomStore } from "@/hooks/useRoomStore";
import Hotspot from "./Hotspot";

export default function Desk() {
  const ref = useRef<Group>(null);

  return (
    <group ref={ref} position={[0, 0, -2]}>
      {/* Tabletop — clearcoat lacquered wood */}
      <Hotspot id="monitor" yOffset={2.2}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <RoundedBox args={[4, 0.12, 2]} radius={0.02} smoothness={4}>
            <meshPhysicalMaterial
              color={COLORS.deskTop}
              roughness={0.45}
              clearcoat={0.3}
              clearcoatRoughness={0.2}
            />
          </RoundedBox>
        </mesh>
      </Hotspot>

      {/* Legs — brushed metal */}
      {[
        [-1.8, 0.75, -0.8],
        [1.8, 0.75, -0.8],
        [-1.8, 0.75, 0.8],
        [1.8, 0.75, 0.8],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.5, 16]} />
          <meshPhysicalMaterial
            color={COLORS.desk}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
      ))}

      {/* Crossbar front */}
      <mesh position={[0, 0.3, 0.8]}>
        <boxGeometry args={[3.6, 0.06, 0.06]} />
        <meshPhysicalMaterial color={COLORS.desk} roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}
