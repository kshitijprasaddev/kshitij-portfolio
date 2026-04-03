import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import Hotspot from "./Hotspot";

const MODEL = "/models/steel_frame_shelves_01/steel_frame_shelves_01_1k.gltf";

export default function Bookshelf() {
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
    <group position={[-5.5, 0, -4]}>
      <Hotspot id="bookshelf" yOffset={4.5}>
        <primitive object={scene} scale={0.002} />
      </Hotspot>
    </group>
  );
}

useGLTF.preload(MODEL);
