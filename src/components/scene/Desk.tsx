import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import Hotspot from "./Hotspot";

const MODEL = "/models/metal_office_desk/metal_office_desk_1k.gltf";

export default function Desk() {
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
    <group position={[0, 0, -2.2]}>
      <Hotspot id="monitor" yOffset={2.2}>
        <primitive object={scene} scale={0.002} />
      </Hotspot>
    </group>
  );
}

useGLTF.preload(MODEL);
