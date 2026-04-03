export default function DeskLamp() {
  return (
    <group position={[-1.6, 1.56, -2.8]}>
      {/* Base — dark metallic */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.08, 16]} />
        <meshPhysicalMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Arm */}
      <mesh position={[0, 0.45, -0.1]} rotation-z={0.15} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 12]} />
        <meshPhysicalMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Shade */}
      <mesh position={[0.06, 0.85, -0.15]} rotation-z={0.3} castShadow>
        <coneGeometry args={[0.18, 0.2, 12, 1, true]} />
        <meshPhysicalMaterial color="#1a1a1e" side={2} roughness={0.5} />
      </mesh>

      {/* Visible glowing bulb — bloom will pick this up */}
      <mesh position={[0.06, 0.76, -0.15]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial
          color="#ffe8c0"
          emissive="#ffe8c0"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Bulb glow light */}
      <pointLight
        position={[0.06, 0.78, -0.15]}
        intensity={0.4}
        color="#ffe8c0"
        distance={3}
        decay={2}
      />
    </group>
  );
}
