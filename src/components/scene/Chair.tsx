import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL = "/models/modern_arm_chair_01/modern_arm_chair_01_1k.gltf";

export default function Chair() {
  const { scene } = useGLTF(MODEL);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.envMapIntensity = 2.5;
          mat.needsUpdate = true;
          mesh.material = mat;
        }
      }
    });
    return clone;
  }, [scene]);

  return (
    <group position={[0, 0, -0.5]} rotation-y={Math.PI * 0.15}>
      <primitive object={model} scale={0.0018} />
    </group>
  );
}

useGLTF.preload(MODEL);
