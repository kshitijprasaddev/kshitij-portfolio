import { MeshReflectorMaterial, useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";
import { COLORS } from "@/lib/constants";

export default function RoomShell() {
  const [diffMap, normalMap, roughMap, aoMap] = useTexture([
    "/textures/concrete_floor_03_diff_1k.jpg",
    "/textures/concrete_floor_03_nor_gl_1k.jpg",
    "/textures/concrete_floor_03_rough_1k.jpg",
    "/textures/concrete_floor_03_ao_1k.jpg",
  ]);

  [diffMap, normalMap, roughMap, aoMap].forEach((tex) => {
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.repeat.set(6, 6);
  });

  return (
    <group>
      {/* PBR textured floor with reflections */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <MeshReflectorMaterial
          map={diffMap}
          normalMap={normalMap}
          roughnessMap={roughMap}
          aoMap={aoMap}
          blur={[300, 100]}
          mirror={0.25}
          mixBlur={1}
          roughness={0.8}
          resolution={1024}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          metalness={0.05}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 4, -6]} receiveShadow>
        <boxGeometry args={[14, 8, 0.15]} />
        <meshStandardMaterial color="#141418" roughness={0.85} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7, 4, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <boxGeometry args={[12, 8, 0.15]} />
        <meshStandardMaterial color="#121216" roughness={0.85} />
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

      {/* Accent line - back wall bottom (green glow for bloom) */}
      <mesh position={[0, 0.02, -5.82]}>
        <boxGeometry args={[14, 0.04, 0.02]} />
        <meshStandardMaterial
          color={COLORS.primary}
          emissive={COLORS.primary}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Accent line - left wall bottom */}
      <mesh position={[-6.82, 0.02, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[12, 0.04, 0.02]} />
        <meshStandardMaterial
          color={COLORS.primary}
          emissive={COLORS.primary}
          emissiveIntensity={1.5}
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
