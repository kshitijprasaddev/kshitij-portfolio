import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

const MODEL = "/models/modern_arm_chair_01/modern_arm_chair_01_1k.gltf";

export default function Chair() {
  const { scene } = useGLTF(MODEL);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group position={[0, 0, -0.5]} rotation-y={Math.PI * 0.15}>
      <primitive object={scene} scale={0.0018} />
    </group>
  );
}

useGLTF.preload(MODEL);
