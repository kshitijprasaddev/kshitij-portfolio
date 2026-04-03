import { COLORS } from "@/lib/constants";

export default function Chair() {
  return (
    <group position={[0, 0, 0]}>
      {/* Seat — matte leather */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshPhysicalMaterial color={COLORS.chairSeat} roughness={0.7} />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, 1.8, -0.45]} castShadow>
        <boxGeometry args={[0.9, 1.2, 0.08]} />
        <meshPhysicalMaterial color={COLORS.chairSeat} roughness={0.7} />
      </mesh>

      {/* Center pole — chrome */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.9, 16]} />
        <meshPhysicalMaterial color={COLORS.chairLeg} metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Base star - 5 legs — chrome */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const x = Math.sin(angle) * 0.4;
        const z = Math.cos(angle) * 0.4;
        return (
          <group key={i}>
            <mesh position={[x * 0.5, 0.08, z * 0.5]} rotation-y={-angle}>
              <boxGeometry args={[0.08, 0.04, 0.4]} />
              <meshPhysicalMaterial color={COLORS.chairLeg} metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Wheel */}
            <mesh position={[x, 0.04, z]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshStandardMaterial color="#222" roughness={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
