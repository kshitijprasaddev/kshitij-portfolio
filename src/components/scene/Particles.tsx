import { useRef, useMemo } from "react";
import { Points, BufferAttribute } from "three";
import { useFrame } from "@react-three/fiber";

export default function Particles() {
  const ref = useRef<Points>(null);
  const count = 200;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Cone-ish distribution from the window area toward the desk
      pos[i * 3] = (Math.random() - 0.5) * 6; // x spread
      pos[i * 3 + 1] = Math.random() * 6 + 1; // y: 1–7 height
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1; // z spread
      spd[i] = 0.1 + Math.random() * 0.3;
    }
    return [pos, spd];
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry;
    const posAttr = geo.getAttribute("position") as BufferAttribute;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Gentle float upward + sine drift
      posAttr.array[idx] += Math.sin(t * 0.3 + i) * 0.001;
      posAttr.array[idx + 1] += speeds[i] * 0.002;
      posAttr.array[idx + 2] += Math.cos(t * 0.2 + i * 0.5) * 0.0008;

      // Reset particles that drift too high
      if (posAttr.array[idx + 1] > 7.5) {
        posAttr.array[idx + 1] = 0.5;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        transparent
        opacity={0.3}
        color="#fff8e0"
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
