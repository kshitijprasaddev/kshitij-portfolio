import { useRef } from "react";
import { Mesh, AdditiveBlending } from "three";
import { useFrame } from "@react-three/fiber";

export default function LightRays() {
  const ray1 = useRef<Mesh>(null);
  const ray2 = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ray1.current) {
      (ray1.current.material as any).opacity =
        0.04 + Math.sin(t * 0.3) * 0.015;
    }
    if (ray2.current) {
      (ray2.current.material as any).opacity =
        0.035 + Math.sin(t * 0.4 + 1) * 0.012;
    }
  });

  return (
    <group>
      {/* Main light beam from window */}
      <mesh
        ref={ray1}
        position={[0, 3.5, -3]}
        rotation={[0.3, 0, 0.15]}
      >
        <planeGeometry args={[2, 8]} />
        <meshBasicMaterial
          color="#e8dcc8"
          transparent
          opacity={0.04}
          blending={AdditiveBlending}
          depthWrite={false}
          side={2}
        />
      </mesh>

      {/* Secondary narrower beam */}
      <mesh
        ref={ray2}
        position={[0.8, 3.2, -3.5]}
        rotation={[0.25, -0.1, 0.2]}
      >
        <planeGeometry args={[1.2, 7]} />
        <meshBasicMaterial
          color="#d4c8b0"
          transparent
          opacity={0.035}
          blending={AdditiveBlending}
          depthWrite={false}
          side={2}
        />
      </mesh>
    </group>
  );
}
