import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import Hotspot from "./Hotspot";

const MODEL = "/models/drawer_cabinet/drawer_cabinet_1k.gltf";

export default function Cabinet() {
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
    <group position={[4.5, 0, -4.5]}>
      <Hotspot id="cabinet" yOffset={3}>
        <primitive object={scene} scale={0.002} />
      </Hotspot>
    </group>
  );
}

useGLTF.preload(MODEL);
