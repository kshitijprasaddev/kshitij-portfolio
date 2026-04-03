import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import Hotspot from "./Hotspot";

const MODEL = "/models/steel_frame_shelves_01/steel_frame_shelves_01_1k.gltf";

export default function Bookshelf() {
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
    <group position={[-5.5, 0, -4]}>
      <Hotspot id="bookshelf" yOffset={4.5}>
        <primitive object={model} scale={0.002} />
      </Hotspot>
    </group>
  );
}

useGLTF.preload(MODEL);
