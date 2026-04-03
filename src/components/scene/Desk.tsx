import { useRef } from "react";
import { Group } from "three";
import { COLORS } from "@/lib/constants";
import { useRoomStore } from "@/hooks/useRoomStore";
import Hotspot from "./Hotspot";

export default function Desk() {
  const ref = useRef<Group>(null);

  return (
    <group ref={ref} position={[0, 0, -2]}>
      {/* Tabletop */}
      <Hotspot id="monitor" yOffset={2.2}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 0.12, 2]} />
          <meshStandardMaterial
            color={COLORS.deskTop}
            roughness={0.6}
            flatShading
          />
        </mesh>
      </Hotspot>

      {/* Legs */}
      {[
        [-1.8, 0.75, -0.8],
        [1.8, 0.75, -0.8],
        [-1.8, 0.75, 0.8],
        [1.8, 0.75, 0.8],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.5, 8]} />
          <meshStandardMaterial
            color={COLORS.desk}
            roughness={0.7}
            flatShading
          />
        </mesh>
      ))}

      {/* Crossbar front */}
      <mesh position={[0, 0.3, 0.8]}>
        <boxGeometry args={[3.6, 0.06, 0.06]} />
        <meshStandardMaterial color={COLORS.desk} roughness={0.7} />
      </mesh>
    </group>
  );
}
