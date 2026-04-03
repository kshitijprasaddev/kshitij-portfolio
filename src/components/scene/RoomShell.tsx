import { COLORS } from "@/lib/constants";

export default function RoomShell() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={COLORS.floor} roughness={0.9} />
      </mesh>

      {/* Floor grid lines (subtle) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial
          color={COLORS.floorLight}
          roughness={0.85}
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 4, -6]} receiveShadow>
        <boxGeometry args={[14, 8, 0.15]} />
        <meshStandardMaterial color={COLORS.wallBack} roughness={0.85} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7, 4, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <boxGeometry args={[12, 8, 0.15]} />
        <meshStandardMaterial color={COLORS.wallSide} roughness={0.85} />
      </mesh>

      {/* Baseboard back */}
      <mesh position={[0, 0.15, -5.88]}>
        <boxGeometry args={[14, 0.3, 0.1]} />
        <meshStandardMaterial color={COLORS.baseboard} roughness={0.7} />
      </mesh>

      {/* Baseboard left */}
      <mesh position={[-6.88, 0.15, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[12, 0.3, 0.1]} />
        <meshStandardMaterial color={COLORS.baseboard} roughness={0.7} />
      </mesh>

      {/* Accent line - back wall bottom (green glow) */}
      <mesh position={[0, 0.02, -5.82]}>
        <boxGeometry args={[14, 0.04, 0.02]} />
        <meshStandardMaterial
          color={COLORS.primary}
          emissive={COLORS.primary}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Accent line - left wall bottom */}
      <mesh position={[-6.82, 0.02, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[12, 0.04, 0.02]} />
        <meshStandardMaterial
          color={COLORS.primary}
          emissive={COLORS.primary}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Ceiling line (subtle border) */}
      <mesh position={[0, 7.98, -5.88]}>
        <boxGeometry args={[14, 0.04, 0.1]} />
        <meshStandardMaterial color={COLORS.baseboard} roughness={0.7} />
      </mesh>
    </group>
  );
}
